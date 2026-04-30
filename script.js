let currentPreview = null;

function openPreview(title, description, type, videoId, vimeoHash = '', stopTime = 45, ctaUrl = 'https://www.reservestock.jp/inquiry/114129') {
    currentPreview = { title, description, type, videoId, vimeoHash, stopTime, ctaUrl };
    const modal = document.getElementById('previewModal');
    const modalTitle = document.getElementById('modalTitle');
    const previewDesc = document.getElementById('previewDesc');
    const player = document.querySelector('.mock-player');
    
    // Prevent event bubbling if the call came from within the overlay
    if (window.event) window.event.stopPropagation();

    modalTitle.innerText = title;
    previewDesc.innerText = description;

    const endScreen = `
        <div class="preview-end-message">
            <h3>プレビューはここまでです</h3>
            <p>この続きは本編にてご覧いただけます。</p>
            <div style="display:flex; gap:15px; justify-content:center; flex-wrap:wrap;">
                <a href="${ctaUrl}" target="_blank" class="btn-primary">今すぐ本編を申し込む</a>
                <button onclick="openPreview(currentPreview.title, currentPreview.description, currentPreview.type, currentPreview.videoId, currentPreview.vimeoHash, currentPreview.stopTime, currentPreview.ctaUrl)" class="btn-secondary" style="color:var(--primary); border-color:var(--primary); cursor:pointer;">もう一度見る</button>
            </div>
        </div>
    `;

    if (type === 'vimeo' && videoId) {
        player.style.background = '#000';
        // ハッシュがある場合とない場合でURLを構築
        const params = 'title=0&byline=0&portrait=0&badge=0&share=0&autopause=0&dnt=1&autoplay=1';
        let embedUrl = `https://player.vimeo.com/video/${videoId}`;
        
        if (vimeoHash) {
            embedUrl += `?h=${vimeoHash}&${params}`;
        } else {
            embedUrl += `?${params}`;
        }
        
        player.innerHTML = `<iframe id="vimeo-player" 
            src="${embedUrl}" 
            width="100%" 
            height="100%" 
            frameborder="0" 
            allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share" 
            style="width:100% !important; height:100% !important;"
            title="${title}"></iframe>`;

        // 自動停止させるロジック
        const vimeoIframe = document.getElementById('vimeo-player');
        if (typeof Vimeo !== 'undefined' && vimeoIframe) {
            const vimeoPlayer = new Vimeo.Player(vimeoIframe);

            vimeoPlayer.on('timeupdate', function (data) {
                // 指定の秒数に達したら停止して終了画面を表示
                if (data.seconds >= stopTime) {
                    vimeoPlayer.pause();
                    player.innerHTML = endScreen;
                }
            });
        }
    } else if (type === 'audio' && videoId) {
        player.style.background = `url('audio_bg.png') center/cover no-repeat`;
        player.innerHTML = `
            <div class="audio-container" style="background: rgba(255,255,255,0.2); backdrop-filter: blur(5px); padding: 40px; border-radius: 20px; text-align: center; width: 80%;">
                <div class="audio-waves"><span></span><span></span><span></span><span></span><span></span></div>
                <audio id="preview-audio" controls autoplay controlsList="nodownload" style="width: 100%; margin-top: 20px;">
                    <source src="${videoId}" type="audio/mpeg">
                    Your browser does not support the audio element.
                </audio>
                <p style="margin-top: 15px; font-weight: 600; color: #fff; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">特別音声をプレビュー中...</p>
            </div>
        `;

        const audio = document.getElementById('preview-audio');
        audio.ontimeupdate = function () {
            if (audio.currentTime >= stopTime) {
                audio.pause();
                player.innerHTML = `
                    <div class="preview-end-message">
                        <h3>試聴はここまでです</h3>
                        <p>21日間、毎日届く音声とメッセージでしっかりサポートします。</p>
                        <div style="display:flex; gap:15px; justify-content:center; flex-wrap:wrap;">
                            <a href="${ctaUrl}" target="_blank" class="btn-primary">レッスンを申し込む</a>
                            <button onclick="openPreview(currentPreview.title, currentPreview.description, currentPreview.type, currentPreview.videoId, currentPreview.vimeoHash, currentPreview.stopTime, currentPreview.ctaUrl)" class="btn-secondary" style="color:var(--primary); border-color:var(--primary); cursor:pointer;">もう一度聴く</button>
                        </div>
                    </div>
                `;
            }
        };
    } else {
        player.style.background = '#000';
        player.innerHTML = '<div class="play-indicator">▶ Preview Playing...</div><p>' + description + '</p>';
    }

    modal.style.display = 'block';
    document.body.style.overflow = 'hidden'; // Scroll lock
}

function closeModal() {
    const modal = document.getElementById('previewModal');
    const player = document.querySelector('.mock-player');
    
    // Clear innerHTML to stop video/audio immediately and reset state
    player.innerHTML = ''; 
    player.style.background = '#000'; // Reset background
    
    modal.style.display = 'none';
    document.body.style.overflow = ''; // Release scroll lock
}

// モーダルの外側をクリックしたら閉じる
window.onclick = function (event) {
    const modal = document.getElementById('previewModal');
    if (event.target == modal) {
        closeModal(); // closeModal関数を通すことで動画も止まる
    }
}

// スクロールに応じたふわっとした表示 (Intersection Observer)
const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
};

const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

document.addEventListener('DOMContentLoaded', () => {
    const revealElements = document.querySelectorAll('.service-card, .diag-item, .reveal, .session-image');
    revealElements.forEach(el => observer.observe(el));
});

// スマホ用ハンバーガーメニューの開閉機能
function toggleMenu() {
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    
    if (hamburger && navLinks) {
        hamburger.classList.toggle('active');
        navLinks.classList.toggle('active');
    }
}
