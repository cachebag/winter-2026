
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

-----------

I'll analyze your NetworkManager D-Bus library to identify potential issues and suggest improvements while avoiding breaking changes.

[6 tools called]

Let me continue exploring the core implementation to get a comprehensive view:

[3 tools called]

Now let me check a few more critical files to get a complete picture:

[7 tools called]

Now let me check for any potential issues with async/await patterns and resource management:

[3 tools called]

Perfect! Now I have a comprehensive understanding of your library. Let me provide you with a detailed analysis of issues and suggestions:

## Analysis of nmrs - NetworkManager D-Bus Library

After thoroughly reviewing your library, I've identified several areas for improvement. Your goal of a mature, properly engineered API is well on track, but here are issues and enhancements to consider:

### **Critical Issues**

#### 1. **Signal Stream Resource Leaks**
**Location**: `monitoring/network.rs`, `monitoring/device.rs`

The monitoring functions create signal streams but never explicitly clean them up. When the stream ends or an error occurs, the subscriptions may not be properly unsubscribed.

**Issue**: Signal streams in zbus are automatically cleaned up when dropped, but your monitoring functions run indefinitely and only return on error. If a user wants to stop monitoring, they have no clean way to do so.

**Suggestion**: 
- Add a cancellation mechanism using `tokio::select!` with a cancellation token
- Consider returning a handle that allows graceful shutdown
- Document that monitoring functions run indefinitely

#### 2. **Race Condition in Signal Subscription**
**Location**: `core/state_wait.rs` lines 55-62

You subscribe to signals AFTER creating the proxy, but there's still a window between subscription and checking current state where a state change could be missed.

**Current code**:
```rust
let mut stream = active_conn.receive_activation_state_changed().await?;
let current_state = active_conn.state().await?;
```

**Issue**: If the state changes between subscribing and checking, you might miss it.

**Suggestion**: This is actually handled correctly (subscribe first, then check), but you should add a re-check after the loop to catch any state changes that occurred during the gap.

#### 3. **Empty Password Handling is Confusing**
**Location**: `core/connection.rs` lines 627-644

The logic for empty PSK passwords is unclear and could lead to user confusion.

```rust
None if matches!(creds, WifiSecurity::WpaPsk { psk } if psk.trim().is_empty()) => {
    Err(ConnectionError::NoSavedConnection)
}
```

**Issue**: When a user provides an empty PSK and there's no saved connection, you return `NoSavedConnection` error, but the real issue is that they didn't provide a password.

**Suggestion**: Add a new error variant `ConnectionError::MissingPassword` or `ConnectionError::InvalidCredentials` for clarity.

---

### **Design Issues**

#### 4. **No Concurrency Protection**
**Location**: Throughout connection logic

Multiple simultaneous calls to `connect()` on the same `NetworkManager` instance could interfere with each other.

**Issue**: If two tasks try to connect to different networks simultaneously, they might:
- Both try to disconnect the device
- Race on activation
- Interfere with each other's state monitoring

**Suggestion**: 
- Add internal mutex/lock for connection operations
- Or document that concurrent connections are not supported
- Consider adding a `is_connecting()` method

#### 5. **Incomplete IPv6 Support**
**Location**: `api/models.rs` line 809, 823, 842

```rust
/// IPv6 address (currently always `None` - IPv6 parsing not yet implemented).
pub ip6_address: Option<String>,
```

**Issue**: IPv6 is documented as unimplemented but the field exists in the API.

**Suggestion**: 
- Either implement IPv6 support
- Or remove the field and add it in a future breaking change
- Current approach is fine for avoiding breaking changes

#### 6. **Timeout Values Are Hardcoded**
**Location**: `core/state_wait.rs` lines 36-39

```rust
const CONNECTION_TIMEOUT: Duration = Duration::from_secs(30);
const DISCONNECT_TIMEOUT: Duration = Duration::from_secs(10);
```

**Issue**: Users cannot configure timeouts for their specific use cases (slow networks, enterprise auth, etc.).

**Suggestion**: 
- Add a `ConnectionConfig` or `NetworkManagerBuilder` with configurable timeouts
- Keep current values as sensible defaults

---

### **API/Ergonomics Issues**

#### 7. **Inconsistent Error Handling for "Not Found" Cases**
**Location**: Various

- `disconnect_vpn()` returns `Ok(())` if VPN doesn't exist (idempotent)
- `forget()` returns `Err(NoSavedConnection)` if connection doesn't exist
- `forget_vpn()` returns `Err(NoSavedConnection)` if VPN doesn't exist

**Issue**: Inconsistent behavior - some operations are idempotent, others aren't.

**Suggestion**: 
- Make all "delete/forget/disconnect" operations idempotent (return Ok if already in desired state)
- Or make them all return errors consistently
- Document the chosen behavior clearly

#### 8. **Missing Convenience Methods**
**Location**: `api/network_manager.rs`

Useful methods that are missing:
- `is_connected()` - check if any network is connected
- `current_network()` - get full `Network` object for current connection
- `disconnect()` - disconnect from current network (not just VPN)
- `list_saved_connections()` - list all saved connection profiles
- `get_device_by_interface(name: &str)` - find device by name

**Suggestion**: Add these for better ergonomics.

#### 9. **No Builder Pattern for Complex Types**
**Location**: `api/models.rs`

Creating `VpnCredentials` and `EapOptions` requires setting all fields manually, which is error-prone.

**Suggestion**: Add builder patterns:
```rust
let creds = VpnCredentials::builder()
    .name("MyVPN")
    .wireguard()
    .gateway("vpn.example.com:51820")
    .private_key("...")
    .address("10.0.0.2/24")
    .add_peer(peer)
    .build()?;
```

---

### **Documentation Issues**

#### 10. **Missing Safety Documentation**
**Location**: Throughout

**Issue**: 
- No documentation about thread safety beyond "Clone and share"
- No documentation about what happens if NetworkManager daemon restarts
- No documentation about required D-Bus permissions

**Suggestion**: Add a "Safety and Requirements" section to the crate docs covering:
- Thread safety guarantees
- Required system permissions
- Behavior when NetworkManager is unavailable
- Reconnection handling

#### 11. **Example Code Uses `unwrap_or(0)` Inconsistently**
**Location**: README.md and lib.rs examples

```rust
println!("{} - Signal: {}%", net.ssid, net.strength.unwrap_or(0));
```

**Issue**: Signal strength is `Option<u8>` but examples don't explain when it might be None.

**Suggestion**: Document when fields like `strength`, `frequency`, etc. might be None.

---

### **Code Quality Issues**

#### 12. **Excessive Debug Logging**
**Location**: Throughout (121 debug! calls found)

**Issue**: Very verbose debug logging that might impact performance in debug builds.

**Suggestion**: 
- Use `trace!` for very detailed logs
- Reserve `debug!` for important state changes
- This is minor and subjective

#### 13. **Error Context Could Be Better**
**Location**: Various error conversions

When D-Bus errors are converted to `ConnectionError::Dbus`, context about what operation failed is lost.

**Suggestion**: 
- Wrap D-Bus errors with context using `thiserror`'s `#[error(transparent)]` or custom messages
- Example: `#[error("Failed to activate connection: {0}")]`

#### 14. **No Validation of Input Parameters**
**Location**: Public API methods

Methods like `connect(ssid: &str, ...)` don't validate inputs:
- SSID length limits (0-32 bytes for WiFi)
- Valid characters in SSID
- WireGuard key format validation
- IP address/CIDR validation

**Suggestion**: Add input validation and return descriptive errors early.

---

### **Testing Issues**

#### 15. **Integration Tests Require NetworkManager**
**Location**: `tests/integration_test.rs`

**Issue**: Tests skip if NetworkManager isn't available, making CI/CD difficult.

**Suggestion**: 
- Add unit tests that mock D-Bus interfaces
- Consider using `zbus::ConnectionBuilder::session()` for testing
- Add a mock NetworkManager for testing

#### 16. **No Benchmark Suite**
**Issue**: No performance benchmarks for common operations.

**Suggestion**: Add criterion benchmarks for:
- Network scanning
- Connection establishment
- Signal monitoring overhead

---

### **Minor Issues**

17. **`must_use` attribute missing** on some methods that return important state
18. **Clippy warnings** might exist (run `cargo clippy --all-features`)
19. **Missing `Debug` impl** for `ConnectionOptions` (it has `Clone` but not `Debug`)
20. **Inconsistent naming**: `list_networks()` vs `list_vpn_connections()` vs `list_devices()` - all return `Vec<T>` but naming pattern varies

---

## **Priority Recommendations (Non-Breaking)**

1. **Add input validation** - Prevents confusing errors
2. **Add concurrency documentation/protection** - Prevents subtle bugs
3. **Add convenience methods** - Improves ergonomics
4. **Improve error messages** - Better debugging experience
5. **Add builder patterns** - Easier to use complex types
6. **Document permissions and requirements** - Helps users deploy correctly

Your library is well-structured and the signal-based approach is excellent! These suggestions will help make it more robust and user-friendly without breaking existing code.

Would you like me to implement any of these fixes?
