
Working notes for code cleanup, performance, and architecture improvements.
Accumulated over time for the 1.x series.

---

## Architecture

### Extract Device Finding Logic

~~`find_wifi_device` and `find_wired_device` in `core/connection.rs` are nearly identical.
Consider a generic `find_device_by_type(conn, device_type) -> Result<OwnedObjectPath>`.
Reduces duplication and makes adding new device types cleaner.~~

### D-Bus Proxy Reuse

~~Each operation creates fresh proxies: `NMProxy::new(conn).await?`.
For high-frequency callers (monitoring loops, batch operations), consider caching
the proxy in `NetworkManager` struct or passing it down through function chains.
Measure actual overhead first.~~

### Connection Builder Trait

~~`build_wifi_connection`, `build_ethernet_connection`, `build_wireguard_connection`
share structural patterns (connection section, IPv4/IPv6 sections, UUID generation).
A `ConnectionBuilder` trait or struct could unify the pattern:~~

```
trait ConnectionBuilder {
    fn connection_type(&self) -> &'static str;
    fn build_type_section(&self) -> HashMap<...>;
    fn build_security_section(&self) -> Option<HashMap<...>>;
}
```
~~Evaluate if the abstraction pulls its weight for 3 connection types~~

### Settings Proxy Abstraction

Raw D-Bus proxy construction is repeated across `vpn.rs`, `connection.rs`,
`connection_settings.rs` for the Settings interface. Extract to a helper:

```rust
async fn settings_proxy(conn: &Connection) -> Result<zbus::Proxy<'_>>
```

---

## Error Handling

~~### ConnectionError Granularity

`ConnectionError::Stuck(String)` is a catch-all. Consider breaking down:
- `StreamEnded` - signal stream closed unexpectedly
- `StateTimeout { expected: ..., actual: ... }` - timed out in wrong state
- `UnexpectedState(DeviceState)` - reached unexpected terminal state

### Error Context Propagation

Several places swallow context: `unwrap_or`, `ok()`, silent `continue`.
For debugging production issues, consider keeping error chains where practical.
The `anyhow` crate could help if thiserror alone is too verbose.

### VPN Error Mapping

In `vpn.rs`, many errors map to `ConnectionStateReason::Unknown`.
Extract specific WireGuard failure modes (key validation, endpoint unreachable)
where NetworkManager provides enough signal context.~~

---

## Performance

### Parallel Device Iteration

`list_devices`, `list_networks`, `for_each_access_point` are sequential.
For systems with many devices/APs, consider `futures::future::join_all` or
`tokio::spawn` for parallel property fetching. Measure on real hardware first.

### Reduce Allocations in Hot Paths

~~`decode_ssid_or_hidden` returns `Cow<'static, str>` but `decode_ssid_or_empty`
returns `String` always. For internal comparisons, a borrowed slice suffices.~~

? - `Network::merge_ap` and deduplication could use `BTreeMap` keyed on `(ssid, freq)`
to avoid the two-pass approach (collect then dedupe).

### Signal Stream Merging

In `monitor_network_changes` and `monitor_device_changes`, creating one boxed stream
per device adds overhead. Evaluate if batching signals or using a single
subscription pattern from the NM root object is more efficient.

---

## API Surface

### Consider Builder Pattern for Public Structs

`VpnCredentials`, `WireGuardPeer`, `EapOptions` have many fields.
A builder would improve ergonomics:

```rust
VpnCredentials::wireguard("MyVPN")
    .gateway("vpn.example.com:51820")
    .private_key("...")
    .address("10.0.0.2/24")
    .peer(...)
    .build()?
```

Decide if the added code is worth the ergonomic gain.

### Expose More Device Properties

`Device` omits some useful properties: `FirmwareVersion`, `Ip4Address`, `Speed`.
Add as `Option<T>` fields where property may not exist on all device types.
The `speed` field was apparently removed intentionally; consider adding back
with proper optionality and doc comments.

### ConnectionOptions Defaults

`ConnectionOptions` has no `Default` impl. Adding one reduces boilerplate:

```rust
impl Default for ConnectionOptions {
    fn default() -> Self {
        Self {
            autoconnect: true,
            autoconnect_priority: None,
            autoconnect_retries: None,
        }
    }
}
```

### Network.device Field

`Network::device` is always empty string in `list_networks`. Either populate it
properly or remove/document the field as deprecated.

---

## Code Quality

### Reduce Repeated Patterns

The pattern of building a proxy, checking a condition, continuing on error
appears dozens of times in `vpn.rs` and `connection.rs`. Consider a helper:

```rust
async fn with_proxy<T>(
    conn: &Connection,
    path: &OwnedObjectPath,
    interface: &str,
    f: impl FnOnce(&Proxy) -> Future<Output = Option<T>>
) -> Option<T>
```

### Constants Module Completeness

`types/constants.rs` defines `device_type::ETHERNET` and `device_type::WIFI` but
comments out `WIFI_P2P` and `LOOPBACK`. Either complete the set or document
which device types are intentionally unsupported.

`device_state` module is incomplete (only 3 states). The full NM enum has ~15.
Either extend or document the partial mapping approach.

### Test Organization

Unit tests in source files are good. Consider adding a dedicated `tests/` module
for property-based tests (quickcheck/proptest) on validation functions:
- `validate_wireguard_key`
- `validate_address`
- `validate_gateway`

### Unused Feature Flag Comments

`wifi.rs` line 179: `// TODO: Expand upon auto/manual configuration options`
Either track as a GitHub issue or remove stale comments.

---

## Validation

### Private Key Validation Strictness

`validate_wireguard_key` is lenient (40-50 chars). WireGuard keys are exactly
44 characters (32 bytes base64 with padding). Consider tightening after
confirming edge cases (keys without padding, whitespace tolerance).

### IPv6 Address Validation

`validate_address` does basic IPv4 validation but minimal IPv6 checking.
Consider using `std::net::IpAddr::from_str` for robust parsing.

### Peer Allowed IPs Validation

Peer `allowed_ips` are passed through without validation. Malformed CIDR
notation could cause silent failures. Validate or document the expected format.

---

## D-Bus Layer

### Signal Race Conditions

`wait_for_connection_activation` subscribes to signals then checks state.
This is correct. Document the pattern clearly for future maintainers.

### Missing NMWired Proxy

The wired proxy exists (`dbus/wired.rs`) but is unused. Either integrate for
wired-specific properties (Speed, Carrier) or remove the dead code.

### Active Connection Property Access

In `vpn.rs`, active connection properties are fetched via raw `call_method`.
Consider extending `NMActiveConnectionProxy` with these properties instead:
- `Connection` property
- `Devices` property

---

## Monitoring

### Callback vs Channel Pattern

Monitoring functions take `F: Fn()` callbacks. For more sophisticated consumers,
consider returning a stream or channel instead:

```rust
pub async fn network_changes(&self) -> impl Stream<Item = NetworkEvent>
```

Allows filtering, debouncing, and async handling at the consumer side.

### Reconnection on Stream End

Monitoring functions return error when streams end. Consider auto-reconnect
logic or documented guidance on how consumers should handle reconnection.

---

## Documentation

### Module-Level Docs

Some modules (`core/mod.rs`, `api/mod.rs`) lack `//!` documentation.
Add module overviews explaining the layer's responsibility.

### Error Documentation

`ConnectionError` variants lack `#[doc]` on individual variants.
Document when each error is returned and suggested recovery actions.

### Example Programs

Consider `examples/` directory with:
- `connect_wifi.rs` - basic connection flow
- `monitor_changes.rs` - real-time monitoring pattern
- `wireguard_vpn.rs` - VPN setup and teardown

---

## GUI Specific (nmrs-gui)

### Theme Loading

Themes are hardcoded CSS files. Consider dynamic theme loading from
`~/.config/nmrs/themes/` for user customization.

### Single Instance Lock

`file_lock.rs` exists. Verify it handles cleanup on crash/SIGKILL.
Consider advisory vs mandatory locking semantics.

---

## Future Proofing

### Connection Type Extensibility

Before adding Bluetooth, 802.1X wired, mobile broadband:
1. Solidify the builder trait approach
2. Add device type constants
3. Consider feature flags for optional device types

### API Versioning

Public types derive `Debug, Clone` but not `Serialize, Deserialize` consistently.
If serialization is needed (config files, IPC), standardize across types.

### Deprecation Path

When breaking changes accumulate for 2.0:
- Mark items `#[deprecated(since = "1.x", note = "...")]`
- Provide migration guidance in CHANGELOG
- Consider compatibility shims where practical

---

## Low Priority / Nice to Have

- [ ] `impl From<Network> for NetworkInfo` for conversion convenience
- [ ] `Device::refresh()` method to update state from D-Bus
- [ ] Rate limiting on monitoring callbacks to avoid UI thrashing
- [ ] Connection timeout configurability (currently hardcoded 30s)
- [ ] Graceful handling of NetworkManager service restart during operations
- [ ] `#[must_use]` on more functions returning `Result`

---
