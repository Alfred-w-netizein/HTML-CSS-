// Aguarda o DOM carregar completamente
document.addEventListener('DOMContentLoaded', function () {

    // Elementos do DOM
    const menuHamburguer = document.getElementById('menu-hamburguer');
    const menuPrincipal = document.getElementById('menu-principal');
    const body = document.body;

    // Criar overlay dinamicamente
    const menuOverlay = document.createElement('div');
    menuOverlay.id = 'menu-overlay';
    document.body.appendChild(menuOverlay);

    // Função para abrir/fechar o menu
    function toggleMenu() {
        const isActive = menuPrincipal.classList.contains('active');

        if (isActive) {
            // Fechar menu
            menuPrincipal.classList.remove('active');
            menuHamburguer.classList.remove('active');
            menuOverlay.classList.remove('active');
            body.classList.remove('menu-open');
        } else {
            // Abrir menu
            menuPrincipal.classList.add('active');
            menuHamburguer.classList.add('active');
            menuOverlay.classList.add('active');
            body.classList.add('menu-open');

            // Adicionar animação de pulsação no ícone
            menuHamburguer.classList.add('pulse');
            setTimeout(() => {
                menuHamburguer.classList.remove('pulse');
            }, 300);
        }
    }

    // Evento de clique no ícone do menu
    menuHamburguer.addEventListener('click', function (e) {
        e.stopPropagation();
        toggleMenu();
    });

    // Evento de clique no overlay para fechar o menu
    menuOverlay.addEventListener('click', function () {
        toggleMenu();
    });

    // Evento de clique nos links do menu (fecha o menu após clique em mobile)
    const menuLinks = document.querySelectorAll('#menu-principal a');
    menuLinks.forEach(link => {
        link.addEventListener('click', function () {
            // Verifica se está em mobile
            if (window.innerWidth < 768) {
                // Adiciona efeito visual no link clicado
                this.classList.add('menu-close');
                setTimeout(() => {
                    this.classList.remove('menu-close');
                }, 300);

                // Fecha o menu após um pequeno delay
                setTimeout(() => {
                    toggleMenu();
                }, 200);
            }
        });
    });

    // Fecha o menu ao pressionar a tecla ESC
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && menuPrincipal.classList.contains('active')) {
            toggleMenu();
        }
    });

    // Fecha o menu ao redimensionar a janela para desktop
    function handleResize() {
        if (window.innerWidth >= 768 && menuPrincipal.classList.contains('active')) {
            // Remove o overlay se existir
            if (menuOverlay && menuOverlay.parentNode) {
                menuOverlay.parentNode.removeChild(menuOverlay);
            }

            // Remove classes ativas
            menuPrincipal.classList.remove('active');
            menuHamburguer.classList.remove('active');
            body.classList.remove('menu-open');
        } else if (window.innerWidth < 768 && !document.getElementById('menu-overlay')) {
            // Recria o overlay se necessário
            if (!document.getElementById('menu-overlay')) {
                const newOverlay = document.createElement('div');
                newOverlay.id = 'menu-overlay';
                document.body.appendChild(newOverlay);

                newOverlay.addEventListener('click', toggleMenu);
            }
        }
    }

    // Evento de redimensionamento da janela
    window.addEventListener('resize', handleResize);

    // Fecha o menu ao clicar fora dele (apenas mobile)
    document.addEventListener('click', function (e) {
        if (window.innerWidth < 768 &&
            menuPrincipal.classList.contains('active') &&
            !menuPrincipal.contains(e.target) &&
            e.target !== menuHamburguer) {
            toggleMenu();
        }
    });

    // Efeito de hover no menu hambúrguer para desktop (visual only)
    menuHamburguer.addEventListener('mouseenter', function () {
        if (window.innerWidth >= 768) {
            this.style.transform = 'scale(1.1)';
        }
    });

    menuHamburguer.addEventListener('mouseleave', function () {
        if (window.innerWidth >= 768) {
            this.style.transform = 'scale(1)';
        }
    });

    // Inicialização
    console.log('Menu hambúrguer carregado com sucesso!');

    // Detecta se é um dispositivo touch
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    if (isTouchDevice) {
        // Adiciona classe para estilos específicos de touch
        body.classList.add('touch-device');

        // Ajusta o padding do header para melhor experiência touch
        document.querySelector('header').style.padding = '12px 20px';
    }
});