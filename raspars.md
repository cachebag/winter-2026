# raspars — Week One

## Where You Are

You have a named project, a validated idea, and a clean workspace setup.

**The idea:** `raspars` is a structure-aware compression tool for developer artifacts. Instead of treating files as raw byte streams like zstd or gzip do, raspars parses the known structure of developer formats — lockfiles, build outputs, dependency trees — and exploits that structure before compression. The result is dramatically better compression ratios on the files developers actually deal with.

**Validation:** Meta's OpenZL (released October 2025) proves the core thesis at datacenter scale — structure-aware compression outperforms generic compression by 2x+ in ratio at equal or better speed. OpenZL targets Parquet, CSV, and numeric timeseries for data engineers. raspars targets `Cargo.lock`, `package-lock.json`, build artifacts, and log archives for developers. The space is wide open.

**Workspace structure:**

```
raspars/
  Cargo.toml              # workspace root
  raspars-core/           # lib — compression logic and transforms
  raspars-formats/        # lib — format detection and parsers
  raspars-cli/            # bin — user-facing CLI
```

---

## Week One Goal

**Prove the thesis on one format.**

Not a polished tool. Not multi-format support. Not a training pipeline. One format, roundtrip correct, measurably better than zstd alone.

By end of week one you should be able to run:

```bash
raspars compress Cargo.lock output.rsp
raspars decompress output.rsp restored.lock
diff Cargo.lock restored.lock  # silence
```

And `output.rsp` should be smaller than `zstd Cargo.lock`.

---

## The Work, Step by Step

### Step 1 — Parse `Cargo.lock`

Start in `raspars-formats`. Write a parser that reads a `Cargo.lock` file and extracts its structure into discrete streams:

- Package names
- Version strings
- Source URLs
- Checksum hashes
- Dependency lists

You are not compressing anything yet. You are just separating structure from values. Think of it as exploding one file into typed columns.

### Step 2 — Compress each stream independently

In `raspars-core`, take each stream from step 1 and compress it independently with zstd. Version strings will compress differently from checksums. Names will compress differently from URLs. By keeping homogeneous data together, zstd gets a much easier job on each stream than it would on the raw mixed file.

This is the core insight: segregation before compression.

### Step 3 — Write a simple archive format

You need a way to bundle the compressed streams back into one file with enough metadata to reverse the process. Keep it simple — a header that records stream count, stream types, and byte offsets, followed by the compressed stream blobs.

Do not over-engineer this. A hand-rolled binary format is fine for week one.

### Step 4 — Decompress and reconstruct

Write the inverse: read the archive, decompress each stream, reassemble the original `Cargo.lock` structure. The output must be byte-for-byte identical to the input. This is your correctness proof.

### Step 5 — Wire up the CLI

In `raspars-cli`, add two subcommands using clap:

```
raspars compress <input> <output>
raspars decompress <input> <output>
```

Thin wrapper only. All logic lives in core and formats.

### Step 6 — Benchmark

Compare compressed size against:

```bash
zstd Cargo.lock
```

If raspars wins, the thesis is proven. Write down the numbers.

---

## What Success Looks Like

- Roundtrip is lossless on at least 5 different `Cargo.lock` files
- Compressed output is smaller than `zstd` at default settings
- Code is cleanly split across the three crates with no logic leaking into the CLI

That is the entire goal. Nothing else matters this week.

---

## What to Ignore This Week

- Format auto-detection
- Cross-file corpus deduplication
- Multiple format support
- Performance optimization
- Error messages
- Documentation

All of that comes later. This week is proof of concept only.

---

## The Bigger Picture

Once week one is done, the path forward is:

1. Add `package-lock.json` support to `raspars-formats`
2. Add cross-file deduplication to `raspars-core` — compress a whole directory as a corpus, not file by file
3. Add format auto-detection so users never have to specify the format
4. Benchmark aggressively and publish the numbers

The name is `raspars` — *raspar* is Spanish for "to scrape, to strip down." It does exactly that: strips data to its essential structure before compressing the rest.

do you store a manifest of which packages came from which file so you can restore them individually, or is the corpus just a monolithic blob? 