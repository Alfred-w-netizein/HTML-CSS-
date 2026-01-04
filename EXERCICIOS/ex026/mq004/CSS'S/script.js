// Detecção de dispositivo e interatividade
document.addEventListener('DOMContentLoaded', function () {

    // Elementos do DOM
    const deviceIcons = document.querySelectorAll('.device-icon');
    const deviceIndicator = document.getElementById('device-indicator');
    const deviceNameSpan = deviceIndicator.querySelector('.device-name');
    const deviceResolutionSpan = deviceIndicator.querySelector('.device-resolution');
    const screenWidth = document.getElementById('screen-width');
    const screenHeight = document.getElementById('screen-height');
    const pixelRatio = document.getElementById('pixel-ratio');
    const orientation = document.getElementById('orientation');
    const body = document.body;

    // Informações dos dispositivos
    const devices = {
        phone: {
            name: 'Telefone',
            resolution: '≤ 767px',
            minWidth: 0,
            maxWidth: 767,
            bgClass: 'phone-bg',
            icon: '📱'
        },
        tablet: {
            name: 'Tablet',
            resolution: '768px - 992px',
            minWidth: 768,
            maxWidth: 992,
            bgClass: 'tablet-bg',
            icon: '📟'
        },
        pc: {
            name: 'Desktop',
            resolution: '993px - 1200px',
            minWidth: 993,
            maxWidth: 1200,
            bgClass: 'pc-bg',
            icon: '💻'
        },
        tv: {
            name: 'TV',
            resolution: '≥ 1201px',
            minWidth: 1201,
            maxWidth: 9999,
            bgClass: 'tv-bg',
            icon: '📺'
        },
        print: {
            name: 'Impressão',
            resolution: 'Modo Impressão',
            bgClass: 'print-bg',
            icon: '🖨️'
        }
    };

    // Função para detectar dispositivo atual
    function detectDevice() {
        const width = window.innerWidth;

        if (width <= 767) return 'phone';
        if (width >= 768 && width <= 992) return 'tablet';
        if (width >= 993 && width <= 1200) return 'pc';
        if (width >= 1201) return 'tv';
    }

    // Atualizar informações da tela
    function updateScreenInfo() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        const ratio = window.devicePixelRatio || 1;
        const orient = window.innerWidth > window.innerHeight ? 'Landscape' : 'Portrait';

        screenWidth.textContent = `${width}px`;
        screenHeight.textContent = `${height}px`;
        pixelRatio.textContent = ratio.toFixed(1);
        orientation.textContent = orient;
    }

    // Ativar dispositivo específico
    function activateDevice(deviceType) {
        // Remover classe ativa de todos os ícones
        deviceIcons.forEach(icon => icon.classList.remove('active'));

        // Adicionar classe ativa ao ícone correspondente
        const targetIcon = document.querySelector(`.device-icon[data-device="${deviceType}"]`);
        if (targetIcon) {
            targetIcon.classList.add('active');
        }

        // Atualizar indicador
        const device = devices[deviceType];
        deviceNameSpan.textContent = device.name;
        deviceResolutionSpan.textContent = device.resolution;

        // Alterar cor de fundo
        body.className = device.bgClass;

        // Adicionar animação
        deviceIndicator.style.animation = 'none';
        setTimeout(() => {
            deviceIndicator.style.animation = 'pulse 2s infinite';
        }, 10);
    }

    // Configurar eventos para os ícones
    deviceIcons.forEach(icon => {
        icon.addEventListener('click', function () {
            const deviceType = this.dataset.device;
            activateDevice(deviceType);

            // Feedback visual
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = '';
            }, 200);
        });
    });

    // Monitorar mudanças no tamanho da tela
    function handleResize() {
        const currentDevice = detectDevice();
        activateDevice(currentDevice);
        updateScreenInfo();
    }

    // Configurar eventos
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    // Configurar evento para impressão
    window.addEventListener('beforeprint', function () {
        activateDevice('print');
    });

    window.addEventListener('afterprint', function () {
        const currentDevice = detectDevice();
        activateDevice(currentDevice);
    });

    // Inicializar
    const initialDevice = detectDevice();
    activateDevice(initialDevice);
    updateScreenInfo();

    // Atualizar a cada segundo (para demonstração)
    setInterval(updateScreenInfo, 1000);

    // Efeito de digitação no título
    const title = document.querySelector('.logo h1');
    const originalText = title.textContent;
    title.textContent = '';
    let i = 0;

    function typeWriter() {
        if (i < originalText.length) {
            title.textContent += originalText.charAt(i);
            i++;
            setTimeout(typeWriter, 100);
        }
    }

    // Iniciar efeito de digitação após 1 segundo
    setTimeout(typeWriter, 1000);

    // Adicionar tooltips
    deviceIcons.forEach(icon => {
        const deviceType = icon.dataset.device;
        const device = devices[deviceType];

        icon.title = `${device.name}\n${device.resolution}\nClique para ativar`;
    });

    // Log para debug
    console.log('Media Queries Lab iniciado com sucesso!');
    console.log(`Dispositivo detectado: ${initialDevice}`);
    console.log(`Resolução: ${window.innerWidth}x${window.innerHeight}`);
});