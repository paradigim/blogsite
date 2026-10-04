"""Generates MILKYARD illustrated product art (SVG placeholders until real photography is shot).
Run: python3 scripts/gen_art.py  -> writes public/images/products/*.svg and public/images/*.svg
"""
import math, random, os

OUT = os.path.join(os.path.dirname(__file__), '..', 'public', 'images')
FONT = "'Nunito','Arial Rounded MT Bold','Helvetica Neue',Arial,sans-serif"

def cow(cx, cy, s=1.0):
    """Tiny vector version of the MILKYARD cow mark."""
    return f'''<g transform="translate({cx},{cy}) scale({s})">
  <path d="M-30-30 q-8-18 2-26 q4 12 10 20z" fill="#fff" stroke="#111" stroke-width="3"/>
  <path d="M30-30 q8-18-2-26 q-4 12-10 20z" fill="#fff" stroke="#111" stroke-width="3"/>
  <ellipse cx="-44" cy="-14" rx="18" ry="9" fill="#FCE003" stroke="#111" stroke-width="3" transform="rotate(18 -44 -14)"/>
  <ellipse cx="44" cy="-14" rx="18" ry="9" fill="#FCE003" stroke="#111" stroke-width="3" transform="rotate(-18 44 -14)"/>
  <path d="M-32-20 q0-26 32-26 q32 0 32 26 v26 h-64z" fill="#FCE003" stroke="#111" stroke-width="3"/>
  <path d="M12-44 q20 2 20 24 v18 q-14 2-20-14 q-6-14 0-28z" fill="#111"/>
  <circle cx="-12" cy="-12" r="4" fill="#111"/><circle cx="14" cy="-12" r="4" fill="#fff"/><circle cx="14" cy="-12" r="2.4" fill="#111"/>
  <ellipse cx="0" cy="14" rx="30" ry="20" fill="#fff" stroke="#111" stroke-width="3"/>
  <circle cx="-10" cy="10" r="3" fill="#111"/><circle cx="10" cy="10" r="3" fill="#111"/>
  <path d="M-9 20 q9 7 18 0" fill="none" stroke="#111" stroke-width="3" stroke-linecap="round"/>
</g>'''

def defs(uid, bg1, bg2):
    return f'''<defs>
  <radialGradient id="bg{uid}" cx="50%" cy="38%" r="75%"><stop offset="0" stop-color="{bg1}"/><stop offset="1" stop-color="{bg2}"/></radialGradient>
  <radialGradient id="sh{uid}" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#3a2a10" stop-opacity=".32"/><stop offset="1" stop-color="#3a2a10" stop-opacity="0"/></radialGradient>
  <linearGradient id="glass{uid}" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset=".25" stop-color="#fff" stop-opacity=".05"/><stop offset=".85" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fff" stop-opacity=".25"/></linearGradient>
</defs>'''

def scene_bg(uid, deco_color):
    rnd = random.Random(uid)
    dots = ''.join(f'<circle cx="{rnd.randint(30,770)}" cy="{rnd.randint(30,300)}" r="{rnd.choice([3,4,5])}" fill="{deco_color}" opacity=".35"/>' for _ in range(10))
    return f'''<rect width="800" height="800" fill="url(#bg{uid})"/>
<circle cx="400" cy="400" r="290" fill="#fff" opacity=".28"/>
<circle cx="400" cy="400" r="330" fill="none" stroke="{deco_color}" stroke-opacity=".25" stroke-width="2" stroke-dasharray="2 12" stroke-linecap="round"/>
{dots}
<rect y="640" width="800" height="160" fill="#000" opacity=".035"/>'''

def shadow(uid, cx=400, cy=650, rx=250, ry=34):
    return f'<ellipse cx="{cx}" cy="{cy}" rx="{rx}" ry="{ry}" fill="url(#sh{uid})"/>'

# ---------- product art ----------
def jar(uid, c1, c2, title, weight, grain=True, lid='#151515'):
    rnd = random.Random(uid + 'g')
    grains = ''
    if grain:
        grains = ''.join(f'<circle cx="{rnd.randint(262,538)}" cy="{rnd.randint(300,630)}" r="{rnd.uniform(1.5,4):.1f}" fill="#fff6c8" opacity="{rnd.uniform(.25,.6):.2f}"/>' for _ in range(160))
    ribs = ''.join(f'<rect x="{x}" y="186" width="5" height="58" rx="2" fill="#fff" opacity=".07"/>' for x in range(272, 535, 14))
    return f'''<defs><linearGradient id="gh{uid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="{c1}"/><stop offset="1" stop-color="{c2}"/></linearGradient>
<clipPath id="jc{uid}"><rect x="250" y="262" width="300" height="384" rx="46"/></clipPath></defs>
{shadow(uid, 400, 648, 190, 26)}
<rect x="250" y="262" width="300" height="384" rx="46" fill="#fffaf0" opacity=".5"/>
<g clip-path="url(#jc{uid})"><rect x="250" y="292" width="300" height="360" fill="url(#gh{uid})"/>{grains}
<path d="M250 296 q75 -14 150 0 t150 0 v-10 h-300z" fill="{c1}" opacity=".7"/></g>
<rect x="250" y="262" width="300" height="384" rx="46" fill="url(#glass{uid})" stroke="#ffffff" stroke-opacity=".7" stroke-width="3"/>
<rect x="272" y="236" width="256" height="40" rx="10" fill="#fff" opacity=".55"/>
<rect x="258" y="176" width="284" height="74" rx="16" fill="{lid}"/>{ribs}
<rect x="258" y="232" width="284" height="10" fill="#FCE003"/>
<rect x="268" y="356" width="264" height="214" rx="14" fill="#FFF8E1"/>
<rect x="268" y="356" width="264" height="18" rx="9" fill="#FCE003"/><rect x="268" y="364" width="264" height="10" fill="#FCE003"/>
{cow(400, 422, .78)}
<text x="400" y="494" text-anchor="middle" font-family="{FONT}" font-weight="900" font-size="38" fill="#111">milkyard</text>
<text x="400" y="526" text-anchor="middle" font-family="{FONT}" font-weight="700" font-size="18" letter-spacing="2" fill="#5b4a1c">{title}</text>
<text x="400" y="554" text-anchor="middle" font-family="{FONT}" font-weight="700" font-size="15" fill="#8a7440">{weight}</text>
<rect x="268" y="290" width="22" height="330" rx="11" fill="#fff" opacity=".35"/>'''

def bowl(uid, metal1, metal2, surface, garnish=('saffron','pista','almond'), layered=False):
    rnd = random.Random(uid + 'b')
    g = ''
    for _ in range(26):
        x = rnd.randint(220, 580); y = rnd.randint(392, 450)
        if ((x-400)/180)**2 + ((y-420)/48)**2 > 1: continue
        kind = rnd.choice(garnish); a = rnd.randint(0, 180)
        if kind == 'saffron': g += f'<rect x="{x}" y="{y}" width="16" height="2.6" rx="1.3" fill="#d9480f" transform="rotate({a} {x} {y})"/>'
        elif kind == 'pista': g += f'<ellipse cx="{x}" cy="{y}" rx="9" ry="4" fill="#7fa83b" stroke="#5c7f26" stroke-width="1" transform="rotate({a} {x} {y})"/>'
        else: g += f'<ellipse cx="{x}" cy="{y}" rx="12" ry="4.5" fill="#f3dfb8" stroke="#c9a46b" stroke-width="1" transform="rotate({a} {x} {y})"/>'
    swirl = ''
    if layered:
        swirl = ''.join(f'<path d="M{240+i*30} {410+rnd.randint(-15,15)} q20 -12 40 0" fill="none" stroke="#e9d3a0" stroke-width="5" stroke-linecap="round" opacity=".8"/>' for i in range(11))
    return f'''<defs><linearGradient id="bw{uid}" x1="0" x2="1"><stop offset="0" stop-color="{metal2}"/><stop offset=".35" stop-color="{metal1}"/><stop offset=".6" stop-color="{metal1}"/><stop offset="1" stop-color="{metal2}"/></linearGradient>
<radialGradient id="kf{uid}" cx="45%" cy="40%" r="70%"><stop offset="0" stop-color="#fffdf3"/><stop offset="1" stop-color="{surface}"/></radialGradient></defs>
{shadow(uid, 400, 640, 230, 30)}
<ellipse cx="400" cy="626" rx="92" ry="18" fill="{metal2}"/>
<path d="M160 418 C170 540 270 622 400 622 C530 622 630 540 640 418 Z" fill="url(#bw{uid})"/>
<path d="M190 440 C210 520 280 580 340 596" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="10" stroke-linecap="round"/>
<ellipse cx="400" cy="418" rx="240" ry="66" fill="{metal1}"/>
<ellipse cx="400" cy="420" rx="214" ry="54" fill="url(#kf{uid})"/>
{swirl}{g}
<ellipse cx="400" cy="418" rx="240" ry="66" fill="none" stroke="#fff" stroke-opacity=".45" stroke-width="4"/>'''

def matka(uid, top='makkhan'):
    rnd = random.Random(uid + 'm')
    if top == 'makkhan':
        cap = '''<path d="M300 318 C292 262 340 222 400 226 C470 222 512 268 500 318 Z" fill="#FFF6DA"/>
<path d="M330 300 C340 268 372 254 404 258 C438 262 462 282 468 300" fill="none" stroke="#f1dfa8" stroke-width="7" stroke-linecap="round"/>
<path d="M360 284 C376 270 410 272 428 288" fill="none" stroke="#f1dfa8" stroke-width="6" stroke-linecap="round"/>
<path d="M392 230 q8 -24 26 -22 q-6 14 -18 24z" fill="#FFF6DA"/>
<ellipse cx="370" cy="262" rx="20" ry="9" fill="#fff" opacity=".8"/>'''
    else:
        cap = '''<ellipse cx="400" cy="320" rx="118" ry="28" fill="#c28348"/><ellipse cx="392" cy="316" rx="80" ry="15" fill="#d9a066" opacity=".8"/>'''
    return f'''<defs><radialGradient id="cl{uid}" cx="38%" cy="40%" r="70%"><stop offset="0" stop-color="#d9824f"/><stop offset=".7" stop-color="#a9502a"/><stop offset="1" stop-color="#7a3518"/></radialGradient></defs>
{shadow(uid, 400, 650, 210, 30)}
<path d="M270 330 C170 380 180 560 260 612 C320 652 480 652 540 612 C620 560 630 380 530 330 Z" fill="url(#cl{uid})"/>
<path d="M248 420 C260 380 290 360 320 350" fill="none" stroke="#fff" stroke-opacity=".25" stroke-width="12" stroke-linecap="round"/>
<path d="M214 470 H586" stroke="#7a3518" stroke-opacity=".35" stroke-width="3"/>
<path d="M222 500 H578" stroke="#e7a77c" stroke-opacity=".35" stroke-width="2"/>
<ellipse cx="400" cy="322" rx="140" ry="34" fill="#b9603a"/>
<ellipse cx="400" cy="320" rx="122" ry="26" fill="#5a2810"/>
{cap}
<rect x="452" y="420" width="104" height="58" rx="10" fill="#FCE003" transform="rotate(-8 504 449)"/>
<text x="504" y="458" text-anchor="middle" font-family="{FONT}" font-weight="900" font-size="20" fill="#111" transform="rotate(-8 504 449)">milkyard</text>
<path d="M440 380 q22 18 40 46" stroke="#111" stroke-width="2" fill="none"/>'''

def sphere_pile(uid, base, dark, light, kind='besan', count=6):
    rnd = random.Random(uid + 'l')
    pos = [(290,540),(400,548),(510,540),(345,452),(455,452),(400,362)][:count]
    out = f'''<defs><radialGradient id="ld{uid}" cx="38%" cy="32%" r="70%"><stop offset="0" stop-color="{light}"/><stop offset=".55" stop-color="{base}"/><stop offset="1" stop-color="{dark}"/></radialGradient>
<linearGradient id="pl{uid}" x1="0" x2="1"><stop offset="0" stop-color="#b8892c"/><stop offset=".5" stop-color="#f1d27a"/><stop offset="1" stop-color="#b8892c"/></linearGradient></defs>
{shadow(uid, 400, 650, 280, 32)}
<ellipse cx="400" cy="610" rx="290" ry="62" fill="url(#pl{uid})"/>
<ellipse cx="400" cy="604" rx="250" ry="46" fill="#f6e1a4"/>
<ellipse cx="400" cy="604" rx="250" ry="46" fill="none" stroke="#c99a3a" stroke-width="2" stroke-dasharray="3 7"/>'''
    for (x, y) in pos:
        r = 74
        tex = ''
        for _ in range(55):
            a = rnd.uniform(0, math.tau); d = r * math.sqrt(rnd.random()) * .92
            px, py = x + d*math.cos(a), y + d*math.sin(a)
            if kind == 'coconut':
                tex += f'<rect x="{px:.0f}" y="{py:.0f}" width="9" height="2.4" rx="1.2" fill="#fff" opacity=".85" transform="rotate({rnd.randint(0,180)} {px:.0f} {py:.0f})"/>'
            elif kind == 'dryfruit' and rnd.random() < .3:
                tex += f'<ellipse cx="{px:.0f}" cy="{py:.0f}" rx="7" ry="4" fill="{rnd.choice(["#7fa83b","#e8c98f","#5a2a1a"])}" transform="rotate({rnd.randint(0,180)} {px:.0f} {py:.0f})"/>'
            else:
                tex += f'<circle cx="{px:.0f}" cy="{py:.0f}" r="{rnd.uniform(1.4,3):.1f}" fill="{rnd.choice([dark, light])}" opacity=".7"/>'
        out += f'<circle cx="{x}" cy="{y}" r="{r}" fill="url(#ld{uid})"/>{tex}'
    out += f'<ellipse cx="400" cy="300" rx="12" ry="6" fill="#7fa83b" transform="rotate(-20 400 300)"/><ellipse cx="414" cy="306" rx="10" ry="4" fill="#d9480f" opacity=".8" transform="rotate(30 414 306)"/>'
    return out

def nut(kind, x, y, a):
    if kind == 'cashew':
        return f'<path d="M0 0 C-4 -18 10 -30 24 -26 C16 -20 12 -12 16 0 C18 10 8 16 0 0Z" fill="#f2d9a6" stroke="#c9a067" stroke-width="1.5" transform="translate({x} {y}) rotate({a}) scale(1.25)"/>'
    if kind == 'almond':
        return f'<path d="M0 -20 C14 -10 14 14 0 22 C-14 14 -14 -10 0 -20Z" fill="#a8622f" stroke="#7c4220" stroke-width="1.5" transform="translate({x} {y}) rotate({a})"/><path d="M-3 -8 q-2 10 0 18" stroke="#c98552" stroke-width="2" fill="none" transform="translate({x} {y}) rotate({a})"/>'
    if kind == 'raisin':
        return f'<ellipse cx="0" cy="0" rx="11" ry="8" fill="#5b2b1c" stroke="#3a180e" stroke-width="1.5" transform="translate({x} {y}) rotate({a})"/>'
    if kind == 'pista':
        return f'<ellipse cx="0" cy="0" rx="15" ry="10" fill="#d8c79a" stroke="#a89466" stroke-width="1.5" transform="translate({x} {y}) rotate({a})"/><ellipse cx="2" cy="0" rx="9" ry="5" fill="#86ad46" transform="translate({x} {y}) rotate({a})"/>'
    if kind == 'walnut':
        return f'<path d="M-16 0 C-16 -16 16 -16 16 0 C16 14 -16 14 -16 0Z" fill="#b98447" stroke="#7e5428" stroke-width="1.5" transform="translate({x} {y}) rotate({a})"/><path d="M0 -12 V12 M-8 -6 q4 6 0 12 M8 -6 q-4 6 0 12" stroke="#7e5428" stroke-width="1.5" fill="none" transform="translate({x} {y}) rotate({a})"/>'
    return ''

def dryfruit_bowl(uid, mix):
    rnd = random.Random(uid + 'd')
    pile = ''
    pts = []
    for _ in range(140):
        x = rnd.uniform(205, 595); y = rnd.uniform(300, 470)
        if ((x-400)/200)**2 + ((y-450)/150)**2 > 1 or y > 470: continue
        pts.append((y, x))
    pts.sort()
    for y, x in pts:
        pile += nut(rnd.choice(mix), round(x), round(y), rnd.randint(0, 359))
    scatter = ''.join(nut(rnd.choice(mix), x, y, rnd.randint(0, 359)) for x, y in [(150,640),(190,668),(640,650),(676,630),(610,684)])
    return f'''<defs><linearGradient id="wd{uid}" x1="0" x2="1"><stop offset="0" stop-color="#6b3d1c"/><stop offset=".45" stop-color="#a7683a"/><stop offset="1" stop-color="#5a3216"/></linearGradient></defs>
{shadow(uid, 400, 650, 240, 30)}
<path d="M168 462 C178 570 270 632 400 632 C530 632 622 570 632 462 Z" fill="url(#wd{uid})"/>
<path d="M200 500 C230 560 280 590 330 604" stroke="#e0a874" stroke-opacity=".35" stroke-width="3" fill="none"/>
<path d="M190 520 C230 580 300 610 360 616" stroke="#e0a874" stroke-opacity=".25" stroke-width="2" fill="none"/>
<ellipse cx="400" cy="462" rx="232" ry="56" fill="#8a5128"/>
<ellipse cx="400" cy="462" rx="212" ry="44" fill="#4a2810"/>
{pile}{scatter}'''

def giftbox(uid):
    return f'''{shadow(uid, 400, 650, 250, 30)}
<path d="M220 420 H580 V630 a10 10 0 0 1 -10 10 H230 a10 10 0 0 1 -10 -10Z" fill="#151515"/>
<rect x="372" y="420" width="56" height="220" fill="#FCE003"/>
<path d="M200 360 H600 V430 H200Z" fill="#FCE003"/>
<rect x="200" y="424" width="400" height="10" fill="#d4b800"/>
<rect x="372" y="360" width="56" height="70" fill="#151515"/>
<path d="M400 360 C340 300 280 300 300 340 C310 362 360 366 400 360Z" fill="#151515"/>
<path d="M400 360 C460 300 520 300 500 340 C490 362 440 366 400 360Z" fill="#151515"/>
<circle cx="400" cy="358" r="16" fill="#2a2a2a"/>
<rect x="250" y="500" width="100" height="70" rx="8" fill="#FFF8E1"/>
<text x="300" y="530" text-anchor="middle" font-family="{FONT}" font-weight="900" font-size="20" fill="#111">milkyard</text>
<text x="300" y="552" text-anchor="middle" font-family="{FONT}" font-weight="700" font-size="11" letter-spacing="2" fill="#8a7440">GIFT BOX</text>
<path d="M226 600 l30 -30 M560 452 l14 14" stroke="#FCE003" stroke-width="3" opacity=".6"/>
<circle cx="640" cy="612" r="44" fill="#e8a53a"/><circle cx="640" cy="612" r="44" fill="#fff" opacity=".08"/>
<circle cx="168" cy="618" r="38" fill="#c98a3c"/>'''

def sandesh(uid, tint='#fbefd2'):
    rnd = random.Random(uid + 's')
    out = f'''{shadow(uid, 400, 650, 280, 30)}
<ellipse cx="400" cy="604" rx="300" ry="70" fill="#e9e3d4"/><ellipse cx="400" cy="598" rx="262" ry="52" fill="#f8f5ec"/>'''
    for (x, y) in [(300,560),(500,560),(400,600),(345,480),(455,480)]:
        out += f'''<ellipse cx="{x}" cy="{y+14}" rx="78" ry="34" fill="#e3cf9f"/>
<ellipse cx="{x}" cy="{y}" rx="78" ry="34" fill="{tint}"/>'''
        for k in range(10):
            a = k*math.tau/10
            out += f'<path d="M{x} {y} L{x+60*math.cos(a):.0f} {y+26*math.sin(a):.0f}" stroke="#e3cf9f" stroke-width="3"/>'
        out += f'<circle cx="{x}" cy="{y}" r="9" fill="#86ad46"/>'
    return out

def paneer(uid):
    out = f'''{shadow(uid, 400, 650, 280, 30)}
<path d="M150 560 L400 470 L660 560 L410 660Z" fill="#b8793e"/><path d="M150 560 L410 660 V680 L150 580Z" fill="#8a5528"/><path d="M410 660 L660 560 V580 L410 680Z" fill="#9b6230"/>'''
    def cube(x, y, s):
        return f'''<path d="M{x} {y} l{s} {-s*.45} l{s} {s*.45} l{-s} {s*.45}z" fill="#fffdf4"/>
<path d="M{x} {y} l{s} {s*.45} v{s} l{-s} {-s*.45}z" fill="#efe6cf"/>
<path d="M{x+s} {y+s*.45} l{s} {-s*.45} v{s} l{-s} {s*.45}z" fill="#e2d6b8"/>'''
    out += cube(300, 470, 110)
    for (x, y) in [(210,560),(470,560),(540,520),(250,600)]:
        out += cube(x, y, 42)
    out += '<path d="M600 470 q20 -20 40 0 q-20 10 -40 0z" fill="#5c8a2e"/><path d="M630 450 q20 -20 40 0 q-20 10 -40 0z" fill="#6f9e38"/>'
    return out

def wrap(uid, body, bg1, bg2, deco, view='0 0 800 800'):
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="{view}" width="800" height="800">{defs(uid, bg1, bg2)}{scene_bg(uid, deco)}{body}</svg>'''

BG = {
    'ghee': ('#FFF4C7', '#F9D769', '#c98a00'),
    'dairy': ('#FFF8E6', '#F4DDB0', '#b9603a'),
    'sweets': ('#FFEFD9', '#F6C58F', '#c2643a'),
    'dryfruits': ('#F6EEDC', '#DCC69B', '#7c4220'),
    'gift': ('#FFF6CC', '#FCE003', '#111111'),
}

PRODUCTS = {
    'pure-cow-ghee': ('ghee', lambda u: jar(u, '#F7CB55', '#E09A12', 'PURE COW GHEE', '500 g')),
    'danedar-desi-ghee': ('ghee', lambda u: jar(u, '#F4C146', '#D98C0A', 'DANEDAR GHEE', '1 kg')),
    'buffalo-ghee': ('ghee', lambda u: jar(u, '#FBF0C8', '#EED89A', 'BUFFALO GHEE', '500 g', lid='#2b2b2b')),
    'bilona-ghee': ('ghee', lambda u: jar(u, '#F2B93A', '#C9800A', 'BILONA GHEE', '500 ml')),
    'kheer-malai': ('dairy', lambda u: bowl(u, '#E7B94C', '#9C6E1C', '#F3E3BC')),
    'malai-rabri': ('dairy', lambda u: bowl(u, '#C8693E', '#7a3518', '#F1DDB0', ('pista', 'almond'), layered=True)),
    'makkhan-bhog': ('dairy', lambda u: matka(u, 'makkhan')),
    'mishti-doi': ('dairy', lambda u: matka(u, 'doi')),
    'malai-paneer': ('dairy', lambda u: paneer(u)),
    'ghee-besan-laddu': ('sweets', lambda u: sphere_pile(u, '#E8A53A', '#B8741A', '#F7D27A', 'besan')),
    'dry-fruit-laddu': ('sweets', lambda u: sphere_pile(u, '#9b5a2c', '#5e3214', '#c98552', 'dryfruit')),
    'narkel-naru': ('sweets', lambda u: sphere_pile(u, '#f0e2c0', '#c9b088', '#fffaf0', 'coconut')),
    'kesar-sandesh': ('sweets', lambda u: sandesh(u, '#fbe3b0')),
    'premium-cashews': ('dryfruits', lambda u: dryfruit_bowl(u, ['cashew'])),
    'california-almonds': ('dryfruits', lambda u: dryfruit_bowl(u, ['almond'])),
    'royal-mixed-dry-fruits': ('dryfruits', lambda u: dryfruit_bowl(u, ['cashew', 'almond', 'raisin', 'pista', 'walnut'])),
    'festive-gift-box': ('gift', lambda u: giftbox(u)),
    'ghee-and-laddu-hamper': ('gift', lambda u: giftbox(u)),
}

def write(path, s):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w') as f: f.write(s)

for slug, (cat, fn) in PRODUCTS.items():
    b1, b2, deco = BG[cat]
    write(f'{OUT}/products/{slug}-1.svg', wrap(slug+'a', fn(slug+'a'), b1, b2, deco))
    # close-up crop
    write(f'{OUT}/products/{slug}-2.svg', wrap(slug+'b', fn(slug+'b'), '#FFFDF6', b1, deco, '170 200 460 460'))
    # alternate backdrop
    write(f'{OUT}/products/{slug}-3.svg', wrap(slug+'c', fn(slug+'c'), '#FFFFFF', '#EFE7D3', deco))

# Hero composite (1200x1000)
def hero():
    u = 'hero'
    j = jar(u+'j', '#F7CB55', '#E09A12', 'PURE COW GHEE', '1 kg')
    m = matka(u+'m', 'makkhan')
    l = sphere_pile(u+'l', '#E8A53A', '#B8741A', '#F7D27A', 'besan')
    k = bowl(u+'k', '#E7B94C', '#9C6E1C', '#F3E3BC')
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 1000" width="1200" height="1000">
<defs><radialGradient id="shhero" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#3a2a10" stop-opacity=".3"/><stop offset="1" stop-color="#3a2a10" stop-opacity="0"/></radialGradient>
<radialGradient id="shheroj" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#3a2a10" stop-opacity=".3"/><stop offset="1" stop-color="#3a2a10" stop-opacity="0"/></radialGradient>
<radialGradient id="shherom" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#3a2a10" stop-opacity=".3"/><stop offset="1" stop-color="#3a2a10" stop-opacity="0"/></radialGradient>
<radialGradient id="shherol" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#3a2a10" stop-opacity=".3"/><stop offset="1" stop-color="#3a2a10" stop-opacity="0"/></radialGradient>
<radialGradient id="shherok" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#3a2a10" stop-opacity=".3"/><stop offset="1" stop-color="#3a2a10" stop-opacity="0"/></radialGradient>
<linearGradient id="glassheroj" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset=".25" stop-color="#fff" stop-opacity=".05"/><stop offset=".85" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fff" stop-opacity=".25"/></linearGradient></defs>
<circle cx="600" cy="520" r="420" fill="#fff" opacity=".35"/>
<circle cx="600" cy="520" r="470" fill="none" stroke="#111" stroke-opacity=".12" stroke-width="2" stroke-dasharray="2 14" stroke-linecap="round"/>
<g transform="translate(650 190) scale(.6)">{l}</g>
<g transform="translate(200 50) scale(1)">{j}</g>
<g transform="translate(-10 390) scale(.75)">{k}</g>
<g transform="translate(570 330) scale(.75)">{m}</g>
<g fill="#7fa83b"><ellipse cx="180" cy="900" rx="16" ry="7" transform="rotate(-20 180 900)"/><ellipse cx="1040" cy="910" rx="14" ry="6" transform="rotate(30 1040 910)"/></g>
<g fill="#f2d9a6" stroke="#c9a067">{nut('cashew', 1080, 860, 40)}{nut('almond', 120, 860, 70)}{nut('almond', 1000, 950, 10)}</g>
</svg>'''
write(f'{OUT}/hero-spread.svg', hero())

# Category tiles
CATS = {'ghee': 'pure-cow-ghee', 'dairy': 'kheer-malai', 'sweets': 'ghee-besan-laddu', 'dryfruits': 'royal-mixed-dry-fruits', 'gift': 'festive-gift-box',
        'new': 'makkhan-bhog', 'best': 'danedar-desi-ghee'}
for c, slug in CATS.items():
    cat = PRODUCTS[slug][0]; b1, b2, deco = BG[cat]
    write(f'{OUT}/categories/{c}.svg', wrap('cat'+c, PRODUCTS[slug][1]('cat'+c), b1, b2, deco, '120 140 560 560'))
print('ok')
