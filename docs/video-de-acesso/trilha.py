import numpy as np, wave, sys
SR = 44100
DUR = float(sys.argv[2])
BPM = 92
beat = 60 / BPM
n = int(SR * DUR)
t = np.arange(n) / SR
out = np.zeros(n)

def nota(m):  # MIDI -> Hz
    return 440 * 2 ** ((m - 69) / 12)

def env(length, a, r):
    e = np.ones(length)
    A = min(int(a * SR), length); R = min(int(r * SR), length)
    e[:A] = np.linspace(0, 1, A)
    if R: e[-R:] *= np.linspace(1, 0, R)
    return e

# Progressão (cada acorde = 2 compassos de 4 tempos): Cmaj9, Am9, Fmaj9, G6/9
acordes = [[48, 55, 64, 71, 74], [45, 52, 60, 67, 71], [41, 48, 57, 64, 67], [43, 50, 59, 64, 69]]
compasso = 4 * beat
dur_acorde = 2 * compasso
rng = np.random.default_rng(7)
pos = 0.0; i = 0
while pos < DUR:
    ac = acordes[i % 4]
    s = int(pos * SR); L = min(int((dur_acorde + 1.2) * SR), n - s)
    if L <= 0: break
    tt = np.arange(L) / SR
    # pad: senoides com leve desafinação, ataque e soltura lentos
    pad = np.zeros(L)
    for m in ac[1:]:
        for d in (-0.08, 0.08):
            pad += np.sin(2 * np.pi * nota(m + d) * tt) * 0.05
    pad *= env(L, 1.4, 1.6)
    # baixo macio
    bx = np.sin(2 * np.pi * nota(ac[0] - 12) * tt) * 0.16 * env(L, 0.3, 1.2)
    out[s:s + L] += pad + bx
    # arpejo de "piano" em colcheias, com algumas pausas
    padrao = [ac[2] + 12, ac[3] + 12, ac[4] + 12, ac[3] + 12, ac[1] + 12, ac[3] + 12, ac[4] + 12, ac[2] + 24]
    for k in range(16):
        if rng.random() < 0.18: continue
        ts = pos + k * beat / 2
        if ts >= DUR: break
        m = padrao[k % 8]
        ss = int(ts * SR); LL = min(int(1.6 * SR), n - ss)
        if LL <= 0: continue
        t2 = np.arange(LL) / SR
        f = nota(m)
        tom = np.sin(2 * np.pi * f * t2) + 0.35 * np.sin(4 * np.pi * f * t2) + 0.12 * np.sin(6 * np.pi * f * t2)
        e = np.exp(-t2 * 3.2) * np.minimum(1, t2 / 0.006)
        out[ss:ss + LL] += tom * e * 0.075 * (0.8 + 0.4 * rng.random())
    pos += dur_acorde; i += 1

# "reverb" simples: ecos com filtro
rev = out.copy()
for atraso, g in ((0.031, 0.35), (0.047, 0.3), (0.071, 0.25), (0.113, 0.2), (0.181, 0.15), (0.29, 0.1)):
    d = int(atraso * SR)
    rev[d:] += out[:-d] * g
k = np.ones(6) / 6
rev = np.convolve(rev, k, mode='same')
mix = 0.65 * out + 0.45 * rev
# fade in/out
fi = int(1.5 * SR); fo = int(3.0 * SR)
mix[:fi] *= np.linspace(0, 1, fi); mix[-fo:] *= np.linspace(1, 0, fo)
mix /= np.max(np.abs(mix)) / 0.7
st = np.stack([mix, np.roll(mix, int(0.012 * SR))], axis=1)
pcm = (st * 32767).astype(np.int16)
with wave.open(sys.argv[1], 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
