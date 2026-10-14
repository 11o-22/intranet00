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
// ■ 콘솔
//       shotNow()   지금 바로 한 장 찍는다

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
function bubble(g, x, y, w, h, tipX) {
    g.fillStyle = '#f4efe2';
    if (g.roundRect) { g.beginPath(); g.roundRect(x, y, w, h, 8); g.fill(); }
    else g.fillRect(x, y, w, h);
    const t = Math.max(x + 9, Math.min(x + w - 9, tipX));
    g.beginPath();
    g.moveTo(t - 5, y + h); g.lineTo(t + 5, y + h); g.lineTo(t, y + h + 6);
    g.closePath(); g.fill();
}

// ── 한 장 그린다
async function draw() {
    const d = look();
    if (!d) throw new Error('광장이 아닙니다');
    const W = Math.round(d.vw), H = Math.round(d.vh);
    const cv = document.createElement('canvas');
    cv.width = W; cv.height = H;
    const g = cv.getContext('2d');
    g.imageSmoothingEnabled = true;
    g.fillStyle = '#07070a';
    g.fillRect(0, 0, W, H);

    // 1) 방 그림 — 카메라가 민 만큼 잘라 깐다
    const room = await load(d.room.img);
    const z = d.room.w / room.naturalWidth;          // 늘린 배 (가로 기준)
    g.drawImage(room,
        d.cx / z, d.cy / z, W / z, H / z,            // 원본에서 떠 올 네모
        0, 0, W, H);

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
        // 이름표
        if (f.name) {
            g.font = 'bold 11px -apple-system, system-ui, sans-serif';
            g.textAlign = 'center';
            g.lineWidth = 3; g.strokeStyle = 'rgba(0,0,0,.85)';
            g.strokeText(f.name, f.x + f.w / 2, f.y + f.tagY);
            g.fillStyle = '#efe6d8';
            g.fillText(f.name, f.x + f.w / 2, f.y + f.tagY);
        }
        // 말풍선 — 글
        if (f.say) {
            const pad = 7, fs = 11;
            g.font = fs + 'px -apple-system, system-ui, sans-serif';
            const tw = Math.min(g.measureText(f.say).width, W * 0.6);
            const bw = tw + pad * 2, bh = fs + pad * 2;
            const bx = Math.max(4, Math.min(W - bw - 4, f.x + f.w / 2 - bw / 2));
            const by = f.y - bh - 10;
            bubble(g, bx, by, bw, bh, f.x + f.w / 2);
            g.fillStyle = '#1a1a1a'; g.textAlign = 'center';
            g.fillText(f.say, bx + bw / 2, by + pad + fs - 2, tw);
        }
        // 말풍선 — 이모티콘
        if (f.emo) {
            let im = null;
            try { im = await load(f.emo); } catch (e) { }
            if (im) {
                const pad = 4;
                const iw = Math.min(im.naturalWidth, 96);
                const ih = Math.round(im.naturalHeight * (iw / im.naturalWidth));
                const bw = iw + pad * 2, bh = ih + pad * 2;
                const bx = Math.max(4, Math.min(W - bw - 4, f.x + f.w / 2 - bw / 2));
                const by = f.y - bh - 10;
                bubble(g, bx, by, bw, bh, f.x + f.w / 2);
                g.drawImage(im, bx + pad, by + pad, iw, ih);
            }
        }
    }

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
function show(cv, name) {
    const old = el('shot-ov'); if (old) old.remove();
    const url = cv.toDataURL('image/png');
    const d = document.createElement('div');
    d.id = 'shot-ov';
    d.innerHTML = '<div class="sh-card">'
        + '<img src="' + url + '" alt="찍은 사진">'
        + '<div class="sh-row">'
        + '<a class="sh-btn go" download="' + name + '" href="' + url + '">저장</a>'
        + '<button class="sh-btn" id="shot-x">닫는다</button>'
        + '</div>'
        + '<div class="sh-tip">저장이 안 되면 그림을 길게 눌러 「사진에 추가」를 쓰십시오.</div>'
        + '</div>';
    document.body.appendChild(d);
    d.addEventListener('pointerdown', function (e) { if (e.target === d) d.remove(); });
    d.querySelector('#shot-x').onclick = function () { d.remove(); };
}

async function take() {
    if (busy) return;
    busy = true;
    try {
        const cv = await draw();
        const t = new Date();
        const p = function (n) { return (n < 10 ? '0' : '') + n; };
        show(cv, '사내시스템_' + t.getFullYear() + p(t.getMonth() + 1) + p(t.getDate())
            + '_' + p(t.getHours()) + p(t.getMinutes()) + p(t.getSeconds()) + '.png');
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
        b.onclick = take;
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
