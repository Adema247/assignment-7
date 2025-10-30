(function ($) {
  "use strict";

  const $doc = $(document);

  $doc.ready(function () {
    const $themeToggle = $('#themeToggle');
    const $progress = $('#progressBar');
    const $toast = $('#toast');
    const LO = window.localStorage;

    (function themeInit() {
      try {
        const saved = LO.getItem('adema_theme') === 'light';
        if (saved) $('html').addClass('light-theme');
        if ($themeToggle.length) {
          $themeToggle.attr('aria-pressed', saved ? 'true' : 'false');
          $themeToggle.text(saved ? 'Light Theme' : 'Dark Theme');
          $themeToggle.on('click', function () {
            const isLight = $('html').toggleClass('light-theme').hasClass('light-theme');
            $(this).attr('aria-pressed', isLight ? 'true' : 'false');
            $(this).text(isLight ? 'Light Theme' : 'Dark Theme');
            try { LO.setItem('adema_theme', isLight ? 'light' : 'dark'); } catch (e) {}
          });
        }
        $(document).on('keydown', function (e) {
          if (e.key.toLowerCase() === 'r' && $themeToggle.length) { $themeToggle.click(); }
        });
      } catch (e) { console.warn(e); }
    })();

    $(window).on('scroll resize', function () {
      const h = $(document).height() - $(window).height();
      const pct = h > 0 ? ($(window).scrollTop() / h) * 100 : 0;
      $progress.css('width', pct + '%');
      $('.count').each(function () {
        const $el = $(this);
        if ($el.data('animated')) return;
        if (isElementInViewport($el)) {
          $el.data('animated', true);
          animateCount($el, Number($el.attr('data-target') || 0), 1400);
        }
      });
    });
    $(window).trigger('scroll');

    function lazyLoad() {
      $('img.lazy').each(function () {
        const $img = $(this);
        if ($img.attr('src') && !$img.attr('data-src')) return;
        if (isElementInViewport($img, 300)) {
          const src = $img.attr('data-src');
          if (src) { $img.attr('src', src); $img.removeAttr('data-src'); $img.removeClass('lazy'); }
        }
      });
    }
    $(window).on('scroll resize load', lazyLoad);
    lazyLoad();

    (function greeting() {
      const $g = $('#greeting');
      if (!$g.length) return;
      const hour = new Date().getHours();
      let text = "Hello — welcome to Adema's Beauty Shop";
      if (hour >= 5 && hour < 12) text = 'Good morning, beauty';
      else if (hour >= 12 && hour < 18) text = 'Good afternoon — shine on';
      else if (hour >= 18 && hour < 22) text = 'Good evening — relax & pamper';
      $g.text(text);
    })();

    $('#readMoreBtn').on('click', function () {
      const $more = $('#aboutMore');
      if (!$more.length) return;
      const shown = $more.css('display') === 'block';
      $more.toggle(!shown);
      $(this).text(shown ? 'Read More' : 'Read Less');
    });

    const $popupOverlay = $('#popupOverlay');
    const showPopup = function () {
      if (!$popupOverlay.length) return;
      $popupOverlay.removeClass('hidden').attr('aria-hidden', 'false');
      $popupOverlay.find('input:first').focus();
    };
    const hidePopup = function () {
      if (!$popupOverlay.length) return;
      $popupOverlay.addClass('hidden').attr('aria-hidden', 'true');
    };
    $('[id^=contactBtn]').on('click', showPopup);
    $('#closePopup').on('click', hidePopup);
    $popupOverlay.on('click', function (e) { if (e.target === this) hidePopup(); });

    $('#popupContactForm').on('submit', function (e) {
      e.preventDefault();
      const $form = $(this);
      clearFormErrors($form);
      const name = $('#popupName').val() || '';
      const email = $('#popupEmail').val() || '';
      const msg = $('#popupMessage').val() || '';
      let ok = true;
      if (!name.trim()) { setError($('#popupNameError'), 'Please enter your name.'); ok = false; }
      if (!validateEmail(email.trim())) { setError($('#popupEmailError'), 'Please enter a valid email.'); ok = false; }
      if (!msg.trim() || msg.trim().length < 10) { setError($('#popupMessageError'), 'Please enter at least 10 characters.'); ok = false; }
      if (!ok) return;
      $('#popupSpinner').removeClass('hidden');
      setTimeout(function () {
        $('#popupSpinner').addClass('hidden');
        $('#popupSuccess').text('Message sent. Thank you!');
        showToast('Message sent \u2705');
        $form[0].reset();
        setTimeout(function () { $('#popupSuccess').text(''); hidePopup(); }, 1200);
      }, 900);
    });
    $('#resetContact').on('click', function () {
      $(this).closest('form')[0].reset();
      clearFormErrors($(this).closest('form'));
    });

    (function multiStep() {
      const $steps = $('.step');
      if (!$steps.length) return;
      let idx = 0;
      showStep(idx);
      function showStep(i) {
        $steps.addClass('hidden');
        $steps.filter('[data-step="' + (i + 1) + '"]').removeClass('hidden');
        $steps.eq(i).find('input,textarea,button').first().focus();
      }
      $('.next-step').on('click', function () {
        if (idx < $steps.length - 1) { idx++; showStep(idx); }
      });
      $('.prev-step').on('click', function () {
        if (idx > 0) { idx--; showStep(idx); }
      });
      $(document).on('keydown', function (e) {
        if ($steps.length === 0) return;
        if (e.key === 'ArrowRight' || e.key === 'End') { if (idx < $steps.length - 1) { idx++; showStep(idx); } }
        if (e.key === 'ArrowLeft' || e.key === 'Home') { if (idx > 0) { idx--; showStep(idx); } }
      });
      $('#contactForm').on('submit', function (e) {
        e.preventDefault();
        const $form = $(this);
        clearFormErrors($form);
        const name = $('#name').val() || '';
        const email = $('#email').val() || '';
        const msg = $('#message').val() || '';
        let ok = true;
        if (!name.trim()) { setError($('#nameError'), 'Please enter your name.'); ok = false; }
        if (!validateEmail(email.trim())) { setError($('#emailError'), 'Please enter a valid email.'); ok = false; }
        if (!msg.trim() || msg.trim().length < 10) { setError($('#messageError'), 'Please enter at least 10 characters.'); ok = false; }
        if (!ok) return;
        $('#formSpinner').removeClass('hidden');
        setTimeout(function () {
          $('#formSpinner').addClass('hidden');
          $('#formSuccess').text('Message sent. Thank you!');
          showToast('Form submitted \u2705');
          $form[0].reset();
          setTimeout(function () { $('#formSuccess').text(''); }, 1600);
        }, 1000);
      });
    })();

    (function searchFilter() {
      const $catalogInput = $('#catalogSearch');
      const $catalogFilter = $('#catalogFilter');
      const $catalogGrid = $('#catalogGrid');
      if ($catalogInput.length) {
        $catalogInput.on('input', function () {
          const q = $(this).val().trim().toLowerCase();
          handleSuggestions($catalogInput, '#suggestions', gatherCatalogTexts());
          filterGrid($catalogGrid, q, $catalogFilter.val());
        });
        $catalogFilter.on('change', function () {
          filterGrid($catalogGrid, $catalogInput.val().trim().toLowerCase(), $(this).val());
        });
      }
      const $brandsInput = $('#brandsSearch');
      const $brandsGrid = $('#brandsGrid');
      if ($brandsInput.length) {
        $brandsInput.on('input', function () {
          const q = $(this).val().trim().toLowerCase();
          handleSuggestions($brandsInput, '#suggestionsBrands', gatherBrandTexts());
          filterGrid($brandsGrid, q);
        });
      }

      function handleSuggestions($input, selector, list) {
        const q = $input.val().trim().toLowerCase();
        const $s = $(selector);
        if (!q) { $s.addClass('hidden'); return; }
        const matches = list.filter(t => t.toLowerCase().includes(q)).slice(0,8);
        if (!matches.length) { $s.addClass('hidden'); return; }
        $s.empty().removeClass('hidden');
        matches.forEach(m => $s.append($('<div>').text(m).on('click', function () { $input.val(m); $s.addClass('hidden'); $input.trigger('input'); })));
      }

      function gatherCatalogTexts() {
        const arr = [];
        $('#catalogGrid .product-card').each(function () {
          arr.push($(this).find('h2').text());
          arr.push($(this).find('p').first().text());
        });
        return arr;
      }
      function gatherBrandTexts() {
        const arr = [];
        $('#brandsGrid .product-card').each(function () {
          arr.push($(this).find('h2').text());
        });
        return arr;
      }

      function filterGrid($grid, q, category) {
        if (!$grid.length) return;
        q = q || '';
        $grid.find('.product-card').each(function () {
          const $card = $(this);
          const name = ($card.find('h2').text() || '').toLowerCase();
          const text = ($card.text() || '').toLowerCase();
          const cat = ($card.attr('data-category') || '').toLowerCase();
          const showByCat = !category || category === '' || cat === category;
          const match = q === '' || name.includes(q) || text.includes(q);
          if (showByCat && match) {
            $card.show();
            highlightText($card, q);
          } else {
            $card.hide();
            removeHighlight($card);
          }
        });
      }
      function highlightText($container, term) {
        removeHighlight($container);
        if (!term) return;
        const regex = new RegExp('(' + escapeRegExp(term) + ')', 'gi');
        $container.find('h2, p').each(function () {
          const html = $(this).html();
          $(this).html(html.replace(regex, '<mark class="hl">$1</mark>'));
        });
      }
      function removeHighlight($container) {
        $container.find('mark.hl').each(function () {
          $(this).replaceWith($(this).text());
        });
      }
    })();

    $('.thumbnails .thumb').on('click', function () {
      const src = $(this).attr('data-src') || $(this).attr('src');
      const $main = $('#mainImage');
      if ($main.length && src) {
        $main.css({ opacity: 0.6 }).attr('src', src).animate({ opacity: 1 }, 240);
        $('.thumbnails .thumb').removeClass('selected');
        $(this).addClass('selected');
      }
    });

    $('.rating .star').each(function () {
      const $s = $(this);
      $s.on('click', function () {
        const val = Number($s.data('value') || 0);
        setStars(val);
        try { LO.setItem('featuredRating', String(val)); } catch (e) {}
      });
      $s.on('mouseenter', function () { setStars(Number($s.data('value'))); });
      $s.on('mouseleave', function () { const saved = Number(LO.getItem('featuredRating') || 0); setStars(saved); });
    });
    (function initStars() { const saved = Number(LO.getItem('featuredRating') || 0); if (saved) setStars(saved); })();
    function setStars(val) {
      $('.rating .star').each(function () {
        const $star = $(this);
        const v = Number($star.data('value') || 0);
        if (v <= val) { $star.addClass('active').text('\u2605').attr('aria-checked', 'true'); } else { $star.removeClass('active').text('\u2606').attr('aria-checked', 'false'); }
      });
      $('#ratingValue').text(val + '/5');
    }

    function playTone(freq = 880, duration = 180, volume = 0.05) {
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = 'sine';
        o.frequency.value = freq;
        g.gain.value = volume;
        o.connect(g); g.connect(ctx.destination);
        o.start();
        setTimeout(() => { o.stop(); ctx.close(); }, duration);
      } catch (e) { console.warn('Audio not available', e); }
    }
    $('#playSoundBtn').on('click', function () { playTone(440, 100, 0.5); });

    $('.buy, #buyBtn').on('click', function () {
      $(this).animate({ transform: 'scale(1.06)' }, 200);
      showToast('Added to cart \u1F6D2');
    });

    $('.copy-btn').on('click', function () {
      const txt = $(this).data('copy') || $(this).closest('.product-card').find('h2').text();
      copyToClipboard(txt);
      showToast('Copied to clipboard \uD83D\uDCCB ');
    });

    function copyToClipboard(text) {
      if (!navigator.clipboard) {
        // fallback
        const $temp = $('<textarea>').val(text).appendTo('body').select();
        try { document.execCommand('copy'); } catch (e) {}
        $temp.remove();
        return;
      }
      navigator.clipboard.writeText(text).catch(() => {});
    }

    function escapeRegExp(string) { return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

    function isElementInViewport($el, offset = 0) {
      if (!$el || !$el.length) return false;
      const rect = $el[0].getBoundingClientRect();
      return rect.top <= (window.innerHeight || document.documentElement.clientHeight) - offset;
    }
    window.isElementInViewport = isElementInViewport;

    function animateCount($el, target, duration) {
      const start = 0;
      const range = target - start;
      const startTime = performance.now();
      function step(now) {
        const progress = Math.min((now - startTime) / duration, 1);
        const val = Math.floor(start + range * easeOutCubic(progress));
        $el.text(val);
        if (progress < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }
    function easeOutCubic(t) { return (--t) * t * t + 1; }

    function setError($el, text) { $el.text(text); }
    function clearFormErrors($form) { $form.find('small.error').text(''); }

    function validateEmail(email) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); }

    function showToast(text, ms = 1800) {
      if (!$toast.length) return;
      $toast.removeClass('hidden').text(text).fadeIn(120);
      setTimeout(function () { $toast.fadeOut(200, function () { $toast.addClass('hidden'); }); }, ms);
    }

    $(document).on('mouseenter', '.copy-btn', function () { $(this).attr('title', 'Copy'); });

    $(document).on('keydown', function (e) {
      if (e.key.toLowerCase() === 't') { $('#showTimeBtn').trigger('click'); }
      if (e.key.toLowerCase() === 'c') { $('[id^=contactBtn]').first().trigger('click'); }
    });

    $('#showTimeBtn').on('click', function () {
      $('#timeDisplay').text(new Date().toLocaleTimeString()).animate({ opacity: 1 }, 200);
    });

    (function footerClock() {
      const $dt = $('#datetimeFooter');
      if (!$dt.length) return;
      function upd() {
        const dt = new Date();
        const options = { year:'numeric', month:'long', day:'numeric', hour:'numeric', minute:'2-digit', second:'2-digit' };
        $dt.text(dt.toLocaleString(undefined, options));
      }
      upd(); setInterval(upd, 1000);
    })();

    $('.thumbnails .thumb').first().addClass('selected');

  });

})(jQuery);