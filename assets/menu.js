/**
 * Gold Coast Concreters QLD - Robust Mobile Navigation Module
 * Standardized position-relative menu drawer, backdrop overlay, body scroll lock,
 * auto-closing on nav clicks, and touch-optimized event handling.
 */
(function () {
    'use strict';

    function initMobileMenu() {
        var menuBtn = document.getElementById('mobile-menu-btn');
        var navLinks = document.getElementById('main-nav-links');

        if (!menuBtn || !navLinks) return;

        // Ensure dynamic backdrop overlay exists
        var backdrop = document.getElementById('mobile-menu-backdrop');
        if (!backdrop) {
            backdrop = document.createElement('div');
            backdrop.id = 'mobile-menu-backdrop';
            backdrop.className = 'mobile-menu-backdrop';
            document.body.appendChild(backdrop);
        }

        // Inject Mobile Menu Drawer Header & Footer Badges if missing
        if (!navLinks.querySelector('.drawer-footer')) {
            var drawerFooter = document.createElement('div');
            drawerFooter.className = 'drawer-footer';
            drawerFooter.innerHTML = 
                '<div class="drawer-trust-badge"><span>QBCC Licensed #1524819</span> • <span>AS 3600</span></div>' +
                '<a href="tel:+61411914157" class="drawer-call-btn">' +
                    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>' +
                    'Call Estimator: 0411 914 157' +
                '</a>';
            navLinks.appendChild(drawerFooter);
        }

        function setMenuState(isOpen) {
            if (isOpen) {
                menuBtn.classList.add('active');
                navLinks.classList.add('active');
                backdrop.classList.add('active');
                document.body.classList.add('menu-open');
                menuBtn.setAttribute('aria-expanded', 'true');
            } else {
                menuBtn.classList.remove('active');
                navLinks.classList.remove('active');
                backdrop.classList.remove('active');
                document.body.classList.remove('menu-open');
                menuBtn.setAttribute('aria-expanded', 'false');
            }
        }

        function handleToggle(e) {
            if (e) {
                e.preventDefault();
                e.stopPropagation();
            }
            var isOpen = navLinks.classList.contains('active');
            setMenuState(!isOpen);
        }

        // Toggle on Hamburger button click
        menuBtn.addEventListener('click', handleToggle);

        // Close when clicking outside on backdrop
        backdrop.addEventListener('click', function (e) {
            e.preventDefault();
            setMenuState(false);
        });

        // Event delegation: auto-close menu when ANY link inside navLinks is clicked
        navLinks.addEventListener('click', function (e) {
            var link = e.target.closest('a');
            if (link) {
                setMenuState(false);
            }
        });

        // Close menu on Escape key
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && navLinks.classList.contains('active')) {
                setMenuState(false);
            }
        });

        // Close on viewport resize above mobile breakpoint
        window.addEventListener('resize', function () {
            if (window.innerWidth > 991 && navLinks.classList.contains('active')) {
                setMenuState(false);
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initMobileMenu);
    } else {
        initMobileMenu();
    }
})();
