# Parameter-driven interactive models

Load `assets/interactive-models.css` and then `assets/interactive-models.js` after the shared lesson renderer. The script mounts four independent, dependency-free models according to the current HTML filename:

| Page | Target | Model |
| --- | --- | --- |
| cha.3.html | #sec3-1-signed | Configurable 4/8-bit two's-complement addition, per-column carry and signed overflow |
| cha.3.html | #content-audio | Adjustable sample rate, depth, sine frequency, channels and duration; SVG waveform, quantization error and PCM payload |
| elecc.5.html | #ict-lesson | Bounded stack/queue, insertion/removal, empty/full feedback and logical top/front/rear |
| elecc.6.html | #ict-lesson | Bubble/selection/insertion sorting, editable arrays, actual comparison counts and held insertion key |

Models start paused. Binary addition, sampling and sorting provide play/pause, single step, reset and speed. Page hiding stops playback. Reduced-motion CSS removes decorative motion. Inputs, status feedback, SVG descriptions and visible text support keyboard and assistive technology use. Sample rates are deliberately small illustrative values; no audio is generated.

Run `node tests/interactive-models.cjs`. The reproducible checks use exported pure functions under `window.ICTInteractiveModels`: all 65,792 possible 4-bit and 8-bit operand pairs agree with mathematical range/modulo calculations; 321 sorting traces preserve the multiset at every step (including the held insertion key) and produce sorted results; known cases confirm comparison counts; empty/full operations preserve data and FIFO/LIFO order is correct; 48 sampling configurations preserve sample count and quantization bounds. These checks passed during implementation. Browser QA should additionally check tabs, controls, mobile wrapping and focus visibility.

Run `node tests/network-tools.cjs` for deterministic timer regressions: TCP pause/resume/reset/restart, repeated DNS queries and HTML rejection, PKI scenario-change timer cancellation, and signed plaintext readability at Eve. These checks use a small fake DOM and virtual clock, and passed during implementation; they do not replace visual browser checks.

Algorithm limits: element-comparison counts exclude loop-bound comparisons; bubble sort includes an early-exit test. Selection sort need not be stable; insertion shifts only strictly larger elements. The stack/queue drawing is a logical sequence, not a circular-buffer implementation. The audio model uses a normalized sine and uniform endpoint quantization, without filters, clipping, headers, padding or compression. A sample rate at or below twice the example frequency is explicitly identified as insufficient for unique reconstruction; higher rates alone are not a complete real-world audio acquisition system.
