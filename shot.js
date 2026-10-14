// ==========================================
// ★ 📷 사진 찍기 — 광장을 한 장으로 남긴다
// bundles.json 마지막 묶음, skip.js 바로 뒤
// ==========================================
//
// ■ 어디에 있나
//
//   사원증 칸 **바로 아래**에 카메라 단추가 붙는다. 누르면 지금 보이는
//   광장이 한 장으로 찍히고, 그 자리에서 보며 저장할 수 있다.
//
// ■ 어떻게 찍나 — 화면을 뜨는 게 아니라 **다시 그린다**
//
//   손전화 브라우저에는 「이 화면을 떠 달라」는 길이 없다. 화면 공유
//   (getDisplayMedia)는 아이폰에서 안 되고, 바깥 꾸러미(html2canvas)는
//   이 집에서 안 쓴다.
//
//   그래서 **광장이 무엇으로 되어 있는지 알고 있는 쪽**이 직접 그린다.
//   광장은 방 그림 한 장과 사람 몇(옷 장을 겹친 것)이 전부라, 캔버스에
//   그 둘만 같은 자리에 올리면 보이는 것과 같은 그림이 나온다.
//
//       1. 방 그림을 카메라가 민 만큼 잘라 깐다
//       2. 사람마다 옷 장을 **보이는 그 칸**으로 겹쳐 올린다
//       3. 이름표와 말풍선은 글자로 다시 적는다
//
//   화면에 뜬 단추·채팅은 일부러 안 넣는다 — 사진에 남기고 싶은 것은
//   방과 사람이지 단추가 아니다.
//
// ■ 당겨 찍기
//
//   찍은 것을 보는 창에 「전체 · ×1.5 · ×2 · ×3」이 있다. 고르면 **나를
//   가운데 두고** 그만큼 당겨 다시 그린다. 사진 크기는 그대로고 담기는
//   넓이만 좁아진다. 방 밖(검은 데)이 들어오지 않게 가장자리에서 멈춘다.
//   글씨·말풍선은 배로 나눠 두어, 당겨도 글자만 커지지 않는다.
//
// ■ 콘솔
//       shotNow()     지금 바로 한 장 (전체)
//       shotNow(2)    두 배로 당겨서

(function shotCam() {

const PAD = 0;                 // 사진 가장자리 여백
let busy = false;

function el(id) { return document.querySelector('#' + id); }

// 광장 안쪽 값을 물어본다 (plaza.js 가 내어 준 문)
function look() {
    try { return (typeof window.plazaShotData === 'function') ? window.plazaShotData() : null; }
    catch (e) { return null; }
}

function load(src) {
    return new Promise(function (ok, no) {
        const im = new Image();
        im.onload = function () { ok(im); };
        im.onerror = no;
        im.src = src;
    });
}

// 말풍선 바탕 — 네모와 아래 꼬리
function bubble(g, x, y, w, h, tipX, u) {
    u = u || 1;
    g.fillStyle = '#f4efe2';
    if (g.roundRect) { g.beginPath(); g.roundRect(x, y, w, h, 8 * u); g.fill(); }
    else g.fillRect(x, y, w, h);
    const t = Math.max(x + 9 * u, Math.min(x + w - 9 * u, tipX));
    g.beginPath();
    g.moveTo(t - 5 * u, y + h); g.lineTo(t + 5 * u, y + h); g.lineTo(t, y + h + 6 * u);
    g.closePath(); g.fill();
}

// ── 한 장 그린다
//
//   ★ 당겨 찍기(zoom) — **나를 가운데 두고** 그만큼 크게 그린다.
//     사진 크기(창 크기)는 그대로 두고 담기는 넓이만 좁아진다.
//     글씨·말풍선은 배로 나눠 두어 당겨도 글자가 커지지 않는다.
async function draw(zoom) {
    const d = look();
    if (!d) throw new Error('광장이 아닙니다');
    const Z = Math.max(1, Math.min(4, Number(zoom) || 1));
    const u = 1 / Z;                                 // 화면 한 칸 = 밑그림 u 칸
    const W = Math.round(d.vw), H = Math.round(d.vh);
    const cv = document.createElement('canvas');
    cv.width = W; cv.height = H;
    const g = cv.getContext('2d');
    g.imageSmoothingEnabled = true;
    g.fillStyle = '#07070a';
    g.fillRect(0, 0, W, H);

    // 가운데에 둘 것
    //   ★ 「전체」(배 1)는 **보이던 그대로**다 — 가운데를 옮기지 않는다.
    //     화면과 똑같아야 하므로 여기서 사람 쪽으로 당기면 안 된다.
    const rx0 = -d.cx, ry0 = -d.cy;
    const rx1 = rx0 + d.room.w, ry1 = ry0 + d.room.h;
    let fx = W / 2, fy = H / 2;
    if (Z > 1) {
        const me = d.folk[0];
        fx = me ? me.x + me.w / 2 : W / 2;
        fy = me ? me.y + me.h / 2 : H / 2;
        // 방 밖(검은 데)이 들어오지 않게 가장자리에서 멈춘다
        const halfW = W * u / 2, halfH = H * u / 2;
        if (d.room.w >= W * u) fx = Math.max(rx0 + halfW, Math.min(rx1 - halfW, fx));
        else fx = (rx0 + rx1) / 2;
        if (d.room.h >= H * u) fy = Math.max(ry0 + halfH, Math.min(ry1 - halfH, fy));
        else fy = (ry0 + ry1) / 2;
    }

    g.save();
    g.translate(W / 2, H / 2);
    g.scale(Z, Z);
    g.translate(-fx, -fy);

    // 1) 방 그림 — 화면에 깔린 그 자리·그 크기로 통째로 깐다
    const room = await load(d.room.img);
    g.drawImage(room, rx0, ry0, d.room.w, d.room.h);

    // 2) 사람 — 보이는 그 칸을 옷 장마다 겹친다
    g.imageSmoothingEnabled = false;                // 도트는 또렷하게
    for (let i = 0; i < d.folk.length; i++) {
        const f = d.folk[i];
        for (let j = 0; j < f.layers.length; j++) {
            const L = f.layers[j];
            let sheet;
            try { sheet = await load(L.src); } catch (e) { continue; }
            const cw = sheet.naturalWidth / 6, ch = sheet.naturalHeight / 2;
            g.save();
            if (f.flip) {                            // 오른쪽을 볼 때는 뒤집어 그린다
                g.translate(f.x + f.w, f.y);
                g.scale(-1, 1);
            } else {
                g.translate(f.x, f.y);
            }
            g.drawImage(sheet, L.col * cw, L.row * ch, cw, ch, 0, 0, f.w, f.h);
            g.restore();
        }
        g.imageSmoothingEnabled = true;
        // 이름표
        if (f.name) {
            g.font = 'bold ' + (11 * u) + 'px -apple-system, system-ui, sans-serif';
            g.textAlign = 'center';
            g.lineWidth = 3 * u; g.strokeStyle = 'rgba(0,0,0,.85)';
            g.strokeText(f.name, f.x + f.w / 2, f.y + f.tagY);
            g.fillStyle = '#efe6d8';
            g.fillText(f.name, f.x + f.w / 2, f.y + f.tagY);
        }
        // 말풍선 — 글
        if (f.say) {
            const pad = 7 * u, fs = 11 * u;
            g.font = fs + 'px -apple-system, system-ui, sans-serif';
            const tw = Math.min(g.measureText(f.say).width, W * u * 0.6);
            const bw = tw + pad * 2, bh = fs + pad * 2;
            const bx = f.x + f.w / 2 - bw / 2;
            const by = f.y - bh - 10 * u;
            bubble(g, bx, by, bw, bh, f.x + f.w / 2, u);
            g.fillStyle = '#1a1a1a'; g.textAlign = 'center';
            g.fillText(f.say, bx + bw / 2, by + pad + fs - 2 * u, tw);
        }
        // 말풍선 — 이모티콘
        if (f.emo) {
            let im = null;
            try { im = await load(f.emo); } catch (e) { }
            if (im) {
                const pad = 4 * u;
                const iw = Math.min(im.naturalWidth, 96) * u;
                const ih = im.naturalHeight * (iw / im.naturalWidth);
                const bw = iw + pad * 2, bh = ih + pad * 2;
                const bx = f.x + f.w / 2 - bw / 2;
                const by = f.y - bh - 10 * u;
                bubble(g, bx, by, bw, bh, f.x + f.w / 2, u);
                g.drawImage(im, bx + pad, by + pad, iw, ih);
            }
        }
        g.imageSmoothingEnabled = false;
    }
    g.restore();
    g.imageSmoothingEnabled = true;

    // 3) 어디에서 찍었는지 한 줄
    g.font = 'bold 11px -apple-system, system-ui, sans-serif';
    g.textAlign = 'left';
    g.lineWidth = 3; g.strokeStyle = 'rgba(0,0,0,.8)';
    g.strokeText('📍 ' + d.room.name, 12, H - 14);
    g.fillStyle = '#ffe9bd';
    g.fillText('📍 ' + d.room.name, 12, H - 14);
    return cv;
}

// ── 찍은 것을 보여 준다
//
//   당긴 배를 고르면 **그 자리에서 다시 그린다.** 광장의 값은 찍을 때
//   한 번만 읽으므로(zoom 은 그림만 다시 그린다), 사람이 움직여도 같은
//   한 장을 배만 바꿔 다시 볼 수 있다.
const ZOOMS = [1, 1.5, 2, 3];

function show(cv, name, z) {
    const old = el('shot-ov'); if (old) old.remove();
    const url = cv.toDataURL('image/png');
    const d = document.createElement('div');
    d.id = 'shot-ov';
    d.innerHTML = '<div class="sh-card">'
        + '<img src="' + url + '" alt="찍은 사진">'
        + '<div class="sh-zoom">' + ZOOMS.map(function (x) {
            return '<button data-z="' + x + '"' + (x === z ? ' class="on"' : '') + '>'
                + (x === 1 ? '전체' : '×' + x) + '</button>';
        }).join('') + '</div>'
        + '<div class="sh-row">'
        + '<a class="sh-btn go" download="' + name + '" href="' + url + '">저장</a>'
        + '<button class="sh-btn" id="shot-x">닫는다</button>'
        + '</div>'
        + '<div class="sh-tip">저장이 안 되면 그림을 길게 눌러 「사진에 추가」를 쓰십시오.</div>'
        + '</div>';
    document.body.appendChild(d);
    d.addEventListener('pointerdown', function (e) { if (e.target === d) d.remove(); });
    d.querySelector('#shot-x').onclick = function () { d.remove(); };
    Array.prototype.forEach.call(d.querySelectorAll('.sh-zoom button'), function (b) {
        b.onclick = function () { take(Number(b.dataset.z)); };
    });
}

async function take(zoom) {
    if (busy) return;
    busy = true;
    const z = Number(zoom) || 1;
    try {
        const cv = await draw(z);
        const t = new Date();
        const p = function (n) { return (n < 10 ? '0' : '') + n; };
        show(cv, '사내시스템_' + t.getFullYear() + p(t.getMonth() + 1) + p(t.getDate())
            + '_' + p(t.getHours()) + p(t.getMinutes()) + p(t.getSeconds())
            + (z > 1 ? '_x' + z : '') + '.png', z);
    } catch (e) {
        if (typeof showCustomAlert === 'function') showCustomAlert('사진을 찍지 못했습니다. ' + (e && e.message || ''));
        else console.warn('[사진] ' + (e && e.message));
    }
    busy = false;
}
window.shotNow = take;

// ── 모양새
(function css() {
    if (document.getElementById('shot-css')) return;
    const s = document.createElement('style');
    s.id = 'shot-css';
    s.textContent = [
        // 사원증 칸 바로 아래에 붙는 단추
        '#plaza-cam{position:absolute;z-index:21;left:12px;width:40px;height:40px;border-radius:50%;',
        '  top:calc(var(--plaza-safe-top,env(safe-area-inset-top,0px)) + 58px);',
        '  border:1px solid rgba(190,170,120,.3);background:rgba(14,14,20,.62);color:#f1e7d6;',
        '  display:flex;align-items:center;justify-content:center;cursor:pointer;',
        '  backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);}',
        '#plaza-cam:active{background:rgba(40,36,28,.85);}',
        // 찍은 것을 보는 창
        '#shot-ov{position:fixed;inset:0;z-index:999997;display:flex;align-items:center;',
        '  justify-content:center;background:rgba(4,4,8,.82);padding:18px;}',
        '.sh-card{max-width:min(92vw,430px);display:flex;flex-direction:column;gap:10px;}',
        '.sh-card img{width:100%;height:auto;border-radius:10px;border:1px solid #3a3a48;',
        '  box-shadow:0 8px 30px rgba(0,0,0,.6);}',
        // 당겨 찍기 — 전체 · ×1.5 · ×2 · ×3
        '.sh-zoom{display:flex;gap:6px;}',
        '.sh-zoom button{flex:1;padding:9px 0;border-radius:10px;font-size:11.5px;cursor:pointer;',
        '  font-family:inherit;background:rgba(255,255,255,.05);border:1px solid #2b2b38;color:#b5ab9a;}',
        '.sh-zoom button.on{background:rgba(217,160,90,.18);border-color:#8a6a2a;color:#ffe9bd;}',
        '.sh-row{display:flex;gap:8px;}',
        '.sh-btn{flex:1;text-align:center;padding:12px 0;border-radius:11px;font-size:12.5px;',
        '  font-family:inherit;cursor:pointer;text-decoration:none;',
        '  background:rgba(255,255,255,.05);border:1px solid #2b2b38;color:#ded5c4;}',
        '.sh-btn.go{background:linear-gradient(145deg,#4a3a1e,#2a2112);border-color:#8a6a2a;color:#ffe9bd;}',
        '.sh-tip{font-size:10.5px;color:#8d8578;text-align:center;line-height:1.6;}'
    ].join('\n');
    document.head.appendChild(s);
})();

// ── 광장이 열릴 때마다 단추를 붙인다
(function hook() {
    const put = function () {
        const ov = el('plaza-ov');
        if (!ov || el('plaza-cam')) return;
        const b = document.createElement('button');
        b.id = 'plaza-cam';
        b.className = 'plaza-keep';
        b.title = '사진을 찍는다';
        b.innerHTML = '<span class="pico" style="--ic:url(\'ico/camera.png\')"></span>';
        b.onclick = function () { take(1); };
        ov.appendChild(b);
    };
    const _open = window.plazaOpen;
    if (typeof _open === 'function') {
        window.plazaOpen = function () {
            const r = _open.apply(this, arguments);
            setTimeout(put, 60);
            return r;
        };
    }
    setInterval(put, 1500);        // 다른 길로 열려도 붙는다
})();

console.log('[사진] 사원증 아래 📷 — shotNow()');

})();
