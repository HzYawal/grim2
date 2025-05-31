// script.js
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM fully loaded and parsed");

    const i18n = window.i18next;
    const i18nextHttpBackend = window.i18nextHttpBackend;
    const i18nextBrowserLanguageDetector = window.i18nextBrowserLanguageDetector;

    // --- DOM 요소 가져오기 ---
    const goalSelect = document.getElementById('goal-select');
    const manualSettingsDiv = document.getElementById('manual-settings');
    const manualTypeSelect = document.getElementById('manual-type-select');
    const targetFreqLabel = document.getElementById('target-freq-label');
    const targetFreqInput = document.getElementById('target-freq-input');
    const baseToneGroup = document.getElementById('base-tone-group');
    const baseToneInput = document.getElementById('base-tone-input');
    const masterVolumeInput = document.getElementById('master-volume');
    const whiteNoiseToggle = document.getElementById('white-noise-toggle');
    const whiteNoiseVolumeInput = document.getElementById('white-noise-volume');
    const playPauseButton = document.getElementById('play-pause-button');
    const currentSoundInfo = document.getElementById('current-sound-info');
    const soundEffectInfo = document.getElementById('sound-effect-info');
    const scientificSourceDiv = document.getElementById('scientific-source');
    const tooltipTextSpan = scientificSourceDiv.querySelector('.tooltip-text');
    const langEnButton = document.getElementById('lang-en');
    const langKoButton = document.getElementById('lang-ko');
    const visualizerSection = document.querySelector('.visualizer-section');
    const visualizerCanvas = document.getElementById('audioVisualizer');
    let canvasCtx;
    let animationFrameId;
    let currentVisualizerFrequency = 0; // 시각화에 사용될 현재 주파수
    let visualizerTime = 0; // 웨이브 애니메이션 시간 변수


    // --- 오디오 변수 및 프리셋 데이터 ---
    let audioCtx; let masterGain; let oscillatorLeft, oscillatorRight;
    let whiteNoiseNode, whiteNoiseGain; let isPlaying = false;
    const DEFAULT_BASE_TONE = 100;
    const PRESETS_CONFIG = {
        manual: { categoryKey: "category_manual", typeKey: "preset.manual.type", effectKey: "preset.manual.effect", source: "" },
        sleep_delta_3hz: { categoryKey: "category_brainwave_binaural", effectHz: 3, baseTone: 90, typeKey: "preset.sleep_delta_3hz.type", effectKey: "preset.sleep_delta_3hz.effect", source: "frontiersin.org, choosemuse.com" },
        meditation_theta_6hz: { categoryKey: "category_brainwave_binaural", effectHz: 6, baseTone: 100, typeKey: "preset.meditation_theta_6hz.type", effectKey: "preset.meditation_theta_6hz.effect", source: "sleepfoundation.org, choosemuse.com" },
        relax_alpha_10hz: { categoryKey: "category_brainwave_binaural", effectHz: 10, baseTone: 100, typeKey: "preset.relax_alpha_10hz.type", effectKey: "preset.relax_alpha_10hz.effect", source: "medicalnewstoday.com, choosemuse.com" },
        focus_beta_15hz: { categoryKey: "category_brainwave_binaural", effectHz: 15, baseTone: 120, typeKey: "preset.focus_beta_15hz.type", effectKey: "preset.focus_beta_15hz.effect", source: "medicalnewstoday.com" },
        memory_beta_18hz: { categoryKey: "category_brainwave_binaural", effectHz: 18, baseTone: 120, typeKey: "preset.memory_beta_18hz.type", effectKey: "preset.memory_beta_18hz.effect", source: "medicalnewstoday.com" },
        peak_gamma_40hz: { categoryKey: "category_brainwave_binaural", effectHz: 40, baseTone: 150, typeKey: "preset.peak_gamma_40hz.type", effectKey: "preset.peak_gamma_40hz.effect", source: "choosemuse.com, news.mit.edu" },
        schumann_7_83hz: { categoryKey: "category_special_binaural", effectHz: 7.83, baseTone: 90, typeKey: "preset.schumann_7_83hz.type", effectKey: "preset.schumann_7_83hz.effect", source: "chiangmaiholistic.com" },
        tuning_432hz: { categoryKey: "category_special_single_tone", singleHz: 432, typeKey: "preset.tuning_432hz.type", effectKey: "preset.tuning_432hz.effect", source: "pmc.ncbi.nlm.nih.gov (일부 연구)" },
        solfeggio_174hz: { categoryKey: "category_solfeggio_single_tone", singleHz: 174, typeKey: "preset.solfeggio_174hz.type", effectKey: "preset.solfeggio_174hz.effect", source: "zenmix.io (솔페지오 이론)" },
        solfeggio_285hz: { categoryKey: "category_solfeggio_single_tone", singleHz: 285, typeKey: "preset.solfeggio_285hz.type", effectKey: "preset.solfeggio_285hz.effect", source: "zenmix.io (솔페지오 이론)" },
        solfeggio_396hz: { categoryKey: "category_solfeggio_single_tone", singleHz: 396, typeKey: "preset.solfeggio_396hz.type", effectKey: "preset.solfeggio_396hz.effect", source: "zenmix.io (솔페지오 이론)" },
        solfeggio_417hz: { categoryKey: "category_solfeggio_single_tone", singleHz: 417, typeKey: "preset.solfeggio_417hz.type", effectKey: "preset.solfeggio_417hz.effect", source: "zenmix.io (솔페지오 이론)" },
        solfeggio_528hz: { categoryKey: "category_solfeggio_single_tone", singleHz: 528, typeKey: "preset.solfeggio_528hz.type", effectKey: "preset.solfeggio_528hz.effect", source: "zenmix.io, scirp.org (일부 연구)" },
        solfeggio_639hz: { categoryKey: "category_solfeggio_single_tone", singleHz: 639, typeKey: "preset.solfeggio_639hz.type", effectKey: "preset.solfeggio_639hz.effect", source: "zenmix.io (솔페지오 이론)" },
        solfeggio_741hz: { categoryKey: "category_solfeggio_single_tone", singleHz: 741, typeKey: "preset.solfeggio_741hz.type", effectKey: "preset.solfeggio_741hz.effect", source: "zenmix.io (솔페지오 이론)" },
        solfeggio_852hz: { categoryKey: "category_solfeggio_single_tone", singleHz: 852, typeKey: "preset.solfeggio_852hz.type", effectKey: "preset.solfeggio_852hz.effect", source: "zenmix.io (솔페지오 이론)" },
        solfeggio_963hz: { categoryKey: "category_solfeggio_single_tone", singleHz: 963, typeKey: "preset.solfeggio_963hz.type", effectKey: "preset.solfeggio_963hz.effect", source: "zenmix.io (솔페지오 이론)" },
    };

    function updateSliderTrackFill(sliderElement) {
        if (!sliderElement) return;
        const value = parseFloat(sliderElement.value);
        const min = parseFloat(sliderElement.min);
        const max = parseFloat(sliderElement.max);
        const percentage = ((value - min) / (max - min)) * 100;
        sliderElement.style.background = `linear-gradient(to right, #bb86fc ${percentage}%, #444 ${percentage}%)`;
    }

    async function initI18next() {
        if (!i18n || !i18nextHttpBackend || !i18nextBrowserLanguageDetector) {
            console.error("i18next libraries not loaded! UI might not be localized.");
            buildGoalSelectStructure();
            updateAllTexts();
            return;
        }

        await i18n
            .use(i18nextHttpBackend)
            .use(i18nextBrowserLanguageDetector)
            .init({
                supportedLngs: ['ko', 'en'],
                fallbackLng: 'en',
                debug: false, // true로 하면 콘솔에 더 많은 로그 출력
                detection: {
                    order: ['navigator', 'cookie', 'localStorage', 'querystring', 'htmlTag'],
                    caches: ['cookie', 'localStorage'],
                    lowerCaseLng: true,
                    load: 'languageOnly',
                },
                backend: {
                    loadPath: 'locales/{{lng}}/translation.json',
                },
                interpolation: {
                    escapeValue: false
                }
            });

        console.log("i18next initialized. Final language used by i18next:", i18n.language);
        document.documentElement.lang = i18n.language.split('-')[0];

        buildGoalSelectStructure(); // Select 박스 구조 먼저 만들고
        updateAllTexts();           // 그 다음에 전체 텍스트 업데이트 (Select 내부 포함)
        updateActiveLangButton();

        i18n.on('languageChanged', (lng) => {
            console.log("Language manually changed to:", lng);
            document.documentElement.lang = lng.split('-')[0];
            updateAllTexts();
            updateActiveLangButton();
        });
    }

    function setupVisualizer() {
        if (!visualizerCanvas) { console.error("Visualizer canvas not found!"); return; }
        canvasCtx = visualizerCanvas.getContext('2d');
        if (!canvasCtx) { console.error("Failed to get canvas context!"); return; }
        // 초기에는 숨겨둠
        if (visualizerSection) visualizerSection.style.display = 'none';
    }

    function drawSimulatedWaveform() {
        if (!canvasCtx || !visualizerCanvas || !isPlaying) {
            if (animationFrameId) cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
            if (visualizerSection) visualizerSection.style.display = 'none';
            return;
        }
        if (visualizerSection) visualizerSection.style.display = 'block';

        animationFrameId = requestAnimationFrame(drawSimulatedWaveform);

        const canvasWidth = visualizerCanvas.width;
        const canvasHeight = visualizerCanvas.height;
        const centerY = canvasHeight / 2;
        let amplitude = canvasHeight / 2.5;
        if (masterGain) { amplitude *= masterGain.gain.value; }

        canvasCtx.clearRect(0, 0, canvasWidth, canvasHeight);
        canvasCtx.lineWidth = 2;
        canvasCtx.strokeStyle = '#bb86fc';
        canvasCtx.beginPath();
        canvasCtx.moveTo(0, centerY);

        // --- waveLengthFactor 계산 로직 (개선안 적용) ---
        let waveLengthFactor;
        const freq = currentVisualizerFrequency; // 가독성을 위해 변수 사용

        if (freq <= 0) {
            waveLengthFactor = canvasWidth / 2; // 기본 파동 (2개 정도)
        } else if (freq < 5) { // 1-4 Hz (매우 긴 파장)
            waveLengthFactor = canvasWidth / (freq * 0.4 + 0.5); // 더 극적인 변화
        } else if (freq < 20) { // 5-19 Hz (긴 파장)
            waveLengthFactor = canvasWidth / (freq * 0.7);
        } else if (freq < 100) { // 20-99 Hz (중간 파장)
            waveLengthFactor = canvasWidth / (freq * 1.0 + 10); // 이전보다 변화폭 조금 더
        } else if (freq < 500) { // 100-499 Hz (짧은 파장)
            waveLengthFactor = canvasWidth / (freq * 1.2 + 30);
        } else { // 500 Hz 이상 (매우 짧은 파장)
            waveLengthFactor = Math.max(3, canvasWidth / (freq * 1.5 + 50)); // 최소 3픽셀은 되도록
        }
        waveLengthFactor = Math.max(3, Math.min(canvasWidth, waveLengthFactor)); // 최소/최대값 제한

        visualizerTime += 0.05; // 웨이브 흐르는 속도

        for (let x = 0; x < canvasWidth; x++) {
            // Math.PI * 2 를 곱하여 x / waveLengthFactor 가 1이 될 때 한 사이클(360도)이 되도록 함
            const y = centerY + amplitude * Math.sin((x / waveLengthFactor) * (Math.PI * 2) + visualizerTime);
            canvasCtx.lineTo(x, y);
        }
        canvasCtx.stroke();
    }

    function startVisualizer(frequency) {
        currentVisualizerFrequency = frequency > 0 ? frequency : 1; // 주파수가 0이면 최소값 1로 처리
        console.log("Starting visualizer with frequency:", currentVisualizerFrequency);
        if (isPlaying && canvasCtx) {
            if (animationFrameId) cancelAnimationFrame(animationFrameId);
            visualizerTime = 0; // 새 주파수로 시작 시 시간 초기화 (선택적)
            drawSimulatedWaveform();
        } else if (isPlaying && !canvasCtx) {
            console.warn("Canvas context not ready for visualizer.");
        }
    }

    function stopVisualizer() {
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
        }
        if (canvasCtx && visualizerCanvas) {
            canvasCtx.clearRect(0, 0, visualizerCanvas.width, visualizerCanvas.height);
        }
        if (visualizerSection) {
            visualizerSection.style.display = 'none';
        }
        currentVisualizerFrequency = 0; // 주파수 초기화
    }


    function updateAllTexts() {
        if (!i18n || !i18n.isInitialized) {
            console.warn("i18next not ready, cannot update texts.");
            // i18next가 준비 안됐을 때 기본값으로라도 시도 (선택적)
            document.querySelectorAll('[data-i18n]').forEach(el => {
                const key = el.getAttribute('data-i18n');
                if (key && el.textContent.trim() === '' && el.tagName !== 'TITLE') { // 비어있으면 일단 키라도 보여주기
                    // el.textContent = `[${key}]`; // 또는 그냥 비워둠
                }
            });
            return;
        }
        console.log("Updating all texts for language:", i18n.language);
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (key && i18n.exists(key)) {
                const translation = i18n.t(key);
                if (el.tagName === 'TITLE') document.title = translation;
                else if (el.tagName === 'INPUT' && (el.type === 'button' || el.type === 'submit') || el.tagName === 'BUTTON') el.textContent = translation;
                else if (el.tagName === 'SMALL' || el.tagName === 'P' || el.tagName === 'H1' || el.tagName === 'H2' || el.tagName === 'H3' || el.tagName === 'LABEL' || el.tagName === 'SPAN') {
                     el.innerHTML = translation; // HTML 태그가 포함될 수 있는 요소들
                }
                else el.textContent = translation;
            } else if (key) {
                 console.warn(`Translation key "${key}" not found for element:`, el);
            }
        });

        updateGoalSelectTexts(); // Select 박스 내부 텍스트 업데이트
        if(playPauseButton) playPauseButton.textContent = isPlaying ? i18n.t('button_pause') : i18n.t('button_play');
        if(manualTypeSelect) updateManualSettingsUI(manualTypeSelect.value); // 수동 설정 UI 레이블 업데이트

        // 현재 재생 정보 업데이트 (중요: isPlaying 상태와 선택된 값에 따라)
        if (!isPlaying && goalSelect) {
            updateInfoDisplayFromPreset(goalSelect.value);
        } else if (isPlaying && goalSelect) {
            // 이미 playSound에서 updateInfoDisplay가 호출되므로 중복 호출 방지 또는 필요시 조건부 호출
            // 여기서는 goalSelect.value가 변경되었을 때 isPlaying이면 playSound가 다시 호출되어 정보를 업데이트함.
            // 만약 언어 변경 시 재생 중인 정보도 다시 번역해야 한다면, 아래와 같이 현재 상태 기반으로 정보 재표시
            const currentPresetKey = goalSelect.value;
            const preset = PRESETS_CONFIG[currentPresetKey];
            let displayInfoText, effectInfoKey, sourceInfo;
             if (currentPresetKey === "manual") {
                const manualType = manualTypeSelect.value;
                const targetFreq = parseFloat(targetFreqInput.value);
                const baseTone = parseFloat(baseToneInput.value) || DEFAULT_BASE_TONE;
                effectInfoKey = PRESETS_CONFIG.manual.effectKey; // preset이 manual 자체일 수 있음
                sourceInfo = PRESETS_CONFIG.manual.source;
                if (manualType === "binaural") {
                    displayInfoText = i18n.t('info_manual_binaural_format', { targetFreq: targetFreq.toFixed(2), baseTone: baseTone.toFixed(2) });
                } else {
                    displayInfoText = i18n.t('info_manual_single_tone_format', { targetFreq: targetFreq.toFixed(2) });
                }
            } else if (preset) {
                displayInfoText = i18n.t(preset.typeKey);
                effectInfoKey = preset.effectKey;
                sourceInfo = preset.source;
            } else { // preset이 없는 경우 (예: 초기 로드 시점)
                displayInfoText = i18n.t('info_waiting_selection');
            }
            if (displayInfoText) updateInfoDisplay(displayInfoText, effectInfoKey, sourceInfo);

        } else if (!isPlaying && currentSoundInfo) { // 어떤 이유로든 정보가 없을 때 기본 메시지
            currentSoundInfo.textContent = i18n.t('info_waiting_selection');
            soundEffectInfo.textContent = '';
            if(scientificSourceDiv) scientificSourceDiv.style.display = 'none';
        }
    }

    function buildGoalSelectStructure() {
        if (!goalSelect || !PRESETS_CONFIG) { console.error("Cannot build goal select: missing element or PRESETS_CONFIG."); if(goalSelect) goalSelect.innerHTML = `<option value="">Error loading presets</option>`; return; }
        console.log("Building goal select structure...");
        goalSelect.innerHTML = '';
        const categories = {};
        for (const key in PRESETS_CONFIG) { const preset = PRESETS_CONFIG[key]; const categoryKey = preset.categoryKey; if (!categories[categoryKey]) { categories[categoryKey] = []; } categories[categoryKey].push({ key, preset }); }
        const categoryOrderKeys = ["category_manual", "category_brainwave_binaural", "category_solfeggio_single_tone", "category_special_binaural", "category_special_single_tone"];
        const sortedCategoryKeys = [...categoryOrderKeys, ...Object.keys(categories).filter(k => !categoryOrderKeys.includes(k))];
        sortedCategoryKeys.forEach(categoryKey => { if (categories[categoryKey]) { const optgroup = document.createElement('optgroup'); optgroup.setAttribute('data-i18n-label', categoryKey); categories[categoryKey].forEach(item => { const option = document.createElement('option'); option.value = item.key; option.setAttribute('data-i18n-text', item.preset.typeKey); /* 텍스트는 updateGoalSelectTexts에서 채움 */ optgroup.appendChild(option); }); goalSelect.appendChild(optgroup); } });
        goalSelect.value = "manual"; // 기본 선택
        console.log("Goal select structure built.");
    }

    function updateGoalSelectTexts() {
        if (!goalSelect || !i18n || !i18n.isInitialized) return;
        console.log("Updating goal select option texts...");
        Array.from(goalSelect.getElementsByTagName('optgroup')).forEach(optgroup => { const labelKey = optgroup.getAttribute('data-i18n-label'); if (labelKey && i18n.exists(labelKey)) optgroup.label = i18n.t(labelKey); });
        Array.from(goalSelect.options).forEach(option => { const textKey = option.getAttribute('data-i18n-text'); if (textKey && i18n.exists(textKey)) option.textContent = i18n.t(textKey); });
        console.log("Goal select texts updated.");
    }

    function updateManualSettingsUI(type) {
        if (!targetFreqLabel || !targetFreqInput || !baseToneGroup || !i18n || !i18n.isInitialized) return;
        const binauralLabelKey = targetFreqLabel.getAttribute('data-i18n-text-binaural') || 'label_target_freq_binaural';
        const singleToneLabelKey = targetFreqLabel.getAttribute('data-i18n-text-single') || 'label_target_freq_single_tone';
        const binauralPlaceholderKey = targetFreqLabel.getAttribute('data-i18n-placeholder-binaural') || 'placeholder_target_freq_binaural';
        const singleTonePlaceholderKey = targetFreqLabel.getAttribute('data-i18n-placeholder-single') || 'placeholder_target_freq_single_tone';

        if (type === "binaural") {
            targetFreqLabel.textContent = i18n.t(binauralLabelKey);
            if(i18n.exists(binauralPlaceholderKey)) targetFreqInput.placeholder = i18n.t(binauralPlaceholderKey); else targetFreqInput.placeholder = "e.g., 3";
            baseToneGroup.style.display = 'block';
        } else { // single_tone
            targetFreqLabel.textContent = i18n.t(singleToneLabelKey);
            if(i18n.exists(singleTonePlaceholderKey)) targetFreqInput.placeholder = i18n.t(singleTonePlaceholderKey); else targetFreqInput.placeholder = "e.g., 432";
            baseToneGroup.style.display = 'none';
        }
    }

    function initAudio() { if (!audioCtx) { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); masterGain = audioCtx.createGain(); masterGain.connect(audioCtx.destination); masterGain.gain.value = parseFloat(masterVolumeInput.value); } if (audioCtx.state === 'suspended') { audioCtx.resume().catch(e => console.error("Error resuming AudioContext:", e)); } }

    function playSound() {
        if (!audioCtx || audioCtx.state !== 'running') {
            initAudio();
            if (!audioCtx || audioCtx.state !== 'running') {
                 if(currentSoundInfo && i18n && i18n.isInitialized) currentSoundInfo.textContent = i18n.t('info_audio_not_ready_retry');
                 return;
            }
        }
        stopOscillators(); // 기존 오실레이터 정지

        let leftFreq, rightFreq, visualFreqToUse;
        const currentPresetKey = goalSelect.value;
        const preset = PRESETS_CONFIG[currentPresetKey];
        if (!preset) { console.error("Selected preset not found:", currentPresetKey); if(currentSoundInfo && i18n && i18n.isInitialized) currentSoundInfo.textContent = i18n.t('info_waiting_selection'); return; }

        let displayInfoText, effectInfoKey, sourceInfo;

        if (currentPresetKey === "manual") {
            const manualType = manualTypeSelect.value;
            const targetFreq = parseFloat(targetFreqInput.value);
            const baseToneVal = parseFloat(baseToneInput.value) || DEFAULT_BASE_TONE;
            effectInfoKey = preset.effectKey; sourceInfo = preset.source;
            if (manualType === "binaural") {
                leftFreq = baseToneVal; rightFreq = baseToneVal + targetFreq;
                visualFreqToUse = baseToneVal; // 바이노럴은 baseTone을 기준으로 시각화 (또는 targetFreq도 가능)
                displayInfoText = i18n.t('info_manual_binaural_format', { targetFreq: targetFreq.toFixed(2), baseTone: baseToneVal.toFixed(2) });
            } else { // single_tone
                leftFreq = targetFreq; rightFreq = targetFreq;
                visualFreqToUse = targetFreq;
                displayInfoText = i18n.t('info_manual_single_tone_format', { targetFreq: targetFreq.toFixed(2) });
            }
        } else { // 프리셋
            if (preset.effectHz !== undefined) { // 바이노럴 프리셋
                leftFreq = preset.baseTone; rightFreq = preset.baseTone + preset.effectHz;
                visualFreqToUse = preset.baseTone;
            } else if (preset.singleHz !== undefined) { // 단일톤 프리셋
                leftFreq = preset.singleHz; rightFreq = preset.singleHz;
                visualFreqToUse = preset.singleHz;
            }
            displayInfoText = i18n.t(preset.typeKey);
            effectInfoKey = preset.effectKey;
            sourceInfo = preset.source;
        }

        if (isNaN(leftFreq) || isNaN(rightFreq) || leftFreq <= 0 || rightFreq <= 0 || isNaN(visualFreqToUse) || visualFreqToUse <=0 ) {
            if(currentSoundInfo && i18n && i18n.isInitialized) currentSoundInfo.textContent = i18n.t('info_invalid_frequency');
            stopVisualizer();
            return;
        }

        oscillatorLeft = audioCtx.createOscillator(); oscillatorLeft.type = 'sine'; oscillatorLeft.frequency.value = leftFreq;
        oscillatorRight = audioCtx.createOscillator(); oscillatorRight.type = 'sine'; oscillatorRight.frequency.value = rightFreq;
        const pannerLeft = audioCtx.createStereoPanner(); pannerLeft.pan.value = -1;
        const pannerRight = audioCtx.createStereoPanner(); pannerRight.pan.value = 1;
        oscillatorLeft.connect(pannerLeft).connect(masterGain);
        oscillatorRight.connect(pannerRight).connect(masterGain);

        try {
            oscillatorLeft.start(audioCtx.currentTime);
            oscillatorRight.start(audioCtx.currentTime);
            isPlaying = true;
            if(playPauseButton && i18n && i18n.isInitialized) playPauseButton.textContent = i18n.t('button_pause');
            startVisualizer(visualFreqToUse); // 시각화 시작
        } catch (e) {
            console.error("Error starting oscillators:", e);
            isPlaying = false;
            if(playPauseButton && i18n && i18n.isInitialized) playPauseButton.textContent = i18n.t('button_play');
            if(currentSoundInfo && i18n && i18n.isInitialized) currentSoundInfo.textContent = i18n.t('info_audio_error_starting');
            stopOscillators();
            stopVisualizer();
            return;
        }
        if (whiteNoiseToggle.checked) playWhiteNoise();
        if(displayInfoText) updateInfoDisplay(displayInfoText, effectInfoKey, sourceInfo);
    }

    function stopSound() {
        stopOscillators();
        stopWhiteNoise();
        isPlaying = false;
        if(playPauseButton && i18n && i18n.isInitialized) playPauseButton.textContent = i18n.t('button_play');
        if(goalSelect && i18n && i18n.isInitialized) updateInfoDisplayFromPreset(goalSelect.value); // 정지 시 현재 선택된 프리셋 정보 표시
        stopVisualizer(); // 시각화 중지
    }

    function stopOscillators() { if (oscillatorLeft) { try { oscillatorLeft.stop(audioCtx.currentTime); } catch (e) {} oscillatorLeft.disconnect(); oscillatorLeft = null; } if (oscillatorRight) { try { oscillatorRight.stop(audioCtx.currentTime); } catch (e) {} oscillatorRight.disconnect(); oscillatorRight = null; } }
    function playWhiteNoise() { if (!audioCtx || audioCtx.state !== 'running') return; if (whiteNoiseNode) { try { whiteNoiseNode.stop(); } catch(e) {} whiteNoiseNode.disconnect(); } const bufferSize = audioCtx.sampleRate * 2; const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate); const output = noiseBuffer.getChannelData(0); for (let i = 0; i < bufferSize; i++) { output[i] = Math.random() * 2 - 1; } whiteNoiseNode = audioCtx.createBufferSource(); whiteNoiseNode.buffer = noiseBuffer; whiteNoiseNode.loop = true; if (!whiteNoiseGain) whiteNoiseGain = audioCtx.createGain(); whiteNoiseGain.gain.value = parseFloat(whiteNoiseVolumeInput.value); whiteNoiseNode.connect(whiteNoiseGain).connect(masterGain); try { whiteNoiseNode.start(audioCtx.currentTime); } catch (e) { console.error("Error starting white noise:", e); } }
    function stopWhiteNoise() { if (whiteNoiseNode) { try { whiteNoiseNode.stop(audioCtx.currentTime); } catch(e) {} whiteNoiseNode.disconnect(); whiteNoiseNode = null; } }

    function updateInfoDisplay(currentSoundTextOrKey, effectKey, source) {
        if (!currentSoundInfo || !soundEffectInfo || !scientificSourceDiv || !tooltipTextSpan || !i18n || !i18n.isInitialized) return;

        let finalCurrentSoundText = currentSoundTextOrKey;
        //  i18n.t()를 이미 거친 텍스트인지, 아니면 키인지 확인하는 더 나은 방법 필요할 수 있음
        //  현재는 preset.typeKey 같은 키 형태('. 포함')인지, 아니면 수동 생성된 텍스트인지로 구분
        if (typeof currentSoundTextOrKey === 'string' && currentSoundTextOrKey.includes('.') && i18n.exists(currentSoundTextOrKey)) {
            finalCurrentSoundText = i18n.t('info_playing_prefix') + " " + i18n.t(currentSoundTextOrKey);
        } else if (typeof currentSoundTextOrKey === 'string' && (currentSoundTextOrKey.startsWith(i18n.t('info_manual_binaural_format', {targetFreq:'', baseTone:''}).substring(0,5)) || currentSoundTextOrKey.startsWith(i18n.t('info_manual_single_tone_format', {targetFreq:''}).substring(0,5)) )) {
             // 수동 생성 포맷은 이미 "Manual: " 또는 "수동: "으로 시작하므로, info_playing_prefix를 붙이지 않음.
             // 대신, 재생 중일 때만 "Playing: " 또는 "재생 중: " 접두사를 붙여줌 (선택적)
            if (isPlaying) {
                finalCurrentSoundText = i18n.t('info_playing_prefix') + " " + currentSoundTextOrKey;
            } else {
                finalCurrentSoundText = currentSoundTextOrKey; // 정지 시에는 접두사 없이
            }
        } else if (typeof currentSoundTextOrKey === 'string') { // 그 외 문자열 (이미 번역된 텍스트)
             if (isPlaying && !currentSoundTextOrKey.startsWith(i18n.t('info_playing_prefix'))) {
                finalCurrentSoundText = i18n.t('info_playing_prefix') + " " + currentSoundTextOrKey;
             } else if (!isPlaying && currentSoundTextOrKey.startsWith(i18n.t('info_playing_prefix'))) {
                finalCurrentSoundText = currentSoundTextOrKey.substring(i18n.t('info_playing_prefix').length).trim();
             }
        }


        currentSoundInfo.textContent = finalCurrentSoundText;
        soundEffectInfo.textContent = i18n.t('info_effect_prefix') + " " + (effectKey && i18n.exists(effectKey) ? i18n.t(effectKey) : i18n.t('info_no_effect'));

        if (source && source.trim() !== "") {
            tooltipTextSpan.textContent = i18n.t('tooltip_source_prefix') + " " + source;
            scientificSourceDiv.style.display = 'inline-block';
        } else {
            scientificSourceDiv.style.display = 'none';
        }
    }

    function updateInfoDisplayFromPreset(presetKey) {
        if (!PRESETS_CONFIG || !i18n || !i18n.isInitialized) return;
        const preset = PRESETS_CONFIG[presetKey];
        if (!preset) {
            if(currentSoundInfo) currentSoundInfo.textContent = i18n.t('info_waiting_selection');
            if(soundEffectInfo) soundEffectInfo.textContent = '';
            if(scientificSourceDiv) scientificSourceDiv.style.display = 'none';
            return;
        }
        let displayInfoText;
        if (presetKey === "manual") {
            const manualType = manualTypeSelect.value;
            const targetFreq = parseFloat(targetFreqInput.value);
            const baseTone = parseFloat(baseToneInput.value) || DEFAULT_BASE_TONE;
            if (manualType === "binaural") {
                displayInfoText = i18n.t('info_manual_binaural_format', { targetFreq: targetFreq.toFixed(2), baseTone: baseTone.toFixed(2) });
            } else {
                displayInfoText = i18n.t('info_manual_single_tone_format', { targetFreq: targetFreq.toFixed(2) });
            }
        } else {
            displayInfoText = i18n.t(preset.typeKey); // 키 자체를 전달
        }
        updateInfoDisplay(displayInfoText, preset.effectKey, preset.source);
    }

    function updateActiveLangButton() {
        if (!langEnButton || !langKoButton || !i18n || !i18n.isInitialized) return;
        const currentLang = i18n.language.startsWith('ko') ? 'ko' : (i18n.language.startsWith('en') ? 'en' : 'en');
        langEnButton.classList.toggle('active', currentLang === 'en');
        langKoButton.classList.toggle('active', currentLang === 'ko');
    }

    // --- 이벤트 리스너 ---
    if(playPauseButton) playPauseButton.addEventListener('click', () => { initAudio(); if (isPlaying) stopSound(); else if (audioCtx && audioCtx.state === 'running') playSound(); else if(currentSoundInfo && i18n && i18n.isInitialized) currentSoundInfo.textContent = i18n.t('info_audio_activating'); });
    if(masterVolumeInput) { masterVolumeInput.addEventListener('input', (e) => { if (masterGain) masterGain.gain.value = parseFloat(e.target.value); updateSliderTrackFill(e.target); });}
    if(whiteNoiseToggle) whiteNoiseToggle.addEventListener('change', (e) => { whiteNoiseVolumeInput.disabled = !e.target.checked; if (audioCtx && audioCtx.state === 'running') { if (e.target.checked && isPlaying) playWhiteNoise(); else stopWhiteNoise(); } });
    if(whiteNoiseVolumeInput) { whiteNoiseVolumeInput.addEventListener('input', (e) => { if (whiteNoiseGain) whiteNoiseGain.gain.value = parseFloat(e.target.value); updateSliderTrackFill(e.target); });}

    if(goalSelect) goalSelect.addEventListener('change', (e) => {
        const selectedValue = e.target.value;
        const preset = PRESETS_CONFIG[selectedValue];
        if (!preset) return;

        if (selectedValue === "manual") {
            if(manualSettingsDiv) manualSettingsDiv.style.display = 'block';
            if(manualTypeSelect) manualTypeSelect.value = "binaural"; // 수동 선택 시 기본은 바이노럴
            if(i18n && i18n.isInitialized) updateManualSettingsUI("binaural");
            if(targetFreqInput) targetFreqInput.value = 3; // 기본값
            if(baseToneInput) baseToneInput.value = DEFAULT_BASE_TONE;
        } else {
            if(manualSettingsDiv) manualSettingsDiv.style.display = 'none';
            if (preset.effectHz !== undefined && targetFreqInput && baseToneInput) { // 바이노럴 프리셋
                targetFreqInput.value = preset.effectHz;
                baseToneInput.value = preset.baseTone;
            } else if (preset.singleHz !== undefined && targetFreqInput) { // 단일톤 프리셋
                targetFreqInput.value = preset.singleHz;
                 // 단일톤일 때는 baseToneInput 값을 특별히 설정할 필요 없음 (UI에서 숨겨짐)
            }
        }
        if (isPlaying) { // 재생 중 프리셋 변경 시
            if (audioCtx && audioCtx.state === 'running') playSound(); // 즉시 소리 변경
            else if(currentSoundInfo && i18n && i18n.isInitialized) currentSoundInfo.textContent = i18n.t('info_setting_changed_play');
        } else { // 정지 상태에서 프리셋 변경 시
            updateInfoDisplayFromPreset(selectedValue);
            stopVisualizer(); // 정지 상태이므로 시각화도 확실히 중지/클리어
        }
    });

    if(manualTypeSelect) manualTypeSelect.addEventListener('change', (e) => {
        if(i18n && i18n.isInitialized) updateManualSettingsUI(e.target.value);
        if (goalSelect && goalSelect.value === "manual") { // 수동 모드일 때만 영향
            if (isPlaying) {
                playSound(); // 재생 중이면 즉시 소리 변경
            } else {
                updateInfoDisplayFromPreset("manual"); // 정지 중이면 정보만 업데이트
                stopVisualizer();
            }
        }
    });

    [targetFreqInput, baseToneInput].forEach(input => {
        if(input) input.addEventListener('input', () => {
            if (goalSelect && goalSelect.value === "manual") { // 수동 모드일 때만 영향
                if (isPlaying) {
                    playSound(); // 재생 중이면 즉시 소리 변경
                } else {
                    updateInfoDisplayFromPreset("manual"); // 정지 중이면 정보만 업데이트
                    stopVisualizer();
                }
            }
        });
    });

    if(langEnButton) langEnButton.addEventListener('click', () => { if(i18n) i18n.changeLanguage('en'); });
    if(langKoButton) langKoButton.addEventListener('click', () => { if(i18n) i18n.changeLanguage('ko'); });

    // --- 초기화 실행 ---
    initI18next().then(() => {
        setupVisualizer(); // i18next 초기화 후 시각화 설정
        if(masterVolumeInput) updateSliderTrackFill(masterVolumeInput);
        if(whiteNoiseVolumeInput) updateSliderTrackFill(whiteNoiseVolumeInput);
        if(goalSelect) goalSelect.dispatchEvent(new Event('change')); // 초기 정보 표시 및 UI 설정
        console.log("HZMindCare App initialized successfully.");
    }).catch(err => {
        console.error("Critical error during app initialization:", err);
        // i18next 실패 시에도 최소한의 UI는 구성
        setupVisualizer();
        buildGoalSelectStructure();
        updateGoalSelectTexts(); // 번역은 안되겠지만 구조라도
        if(masterVolumeInput) updateSliderTrackFill(masterVolumeInput);
        if(whiteNoiseVolumeInput) updateSliderTrackFill(whiteNoiseVolumeInput);
        if(goalSelect) goalSelect.dispatchEvent(new Event('change'));
        if(currentSoundInfo) currentSoundInfo.textContent = "Error initializing app. Please refresh.";
    });
});