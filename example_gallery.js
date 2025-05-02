// gallery.js
// mbaggett - baggett.michael@gmail.com

document.addEventListener("DOMContentLoaded", function () {
  // ─── Inject the .supress CSS ───────────────────────────────────────────────
  const styleSheet = document.createElement("style");
  styleSheet.type = "text/css";
  styleSheet.innerText = `
    button.supress {
    pointer-events: none !important;
      opacity: .5!important;
    }
  `;
  document.head.appendChild(styleSheet);

  // ─── Configurable Constants ────────────────────────────────────────────────
  const IMAGE_FOLDER           = 'images';
  const SELECTED_BORDER_COLOR  = 'cyan';
  const DEFAULT_BORDER_COLOR   = '#999';
  const COLORS = [
    '#a6a6a6', 'transparent', '#ffffff', '#f0f0f0', '#d9d9d9', '#bfbfbf', '#8c8c8c', '#ff0000', '#ff2300',
    '#ff4700', '#ff6a00', '#ff8e00', '#ffb100', '#ffd500', '#fff900', '#e1ff00', '#bdff00',
    '#9aff00', '#76ff00', '#53ff00', '#2fff00', '#0bff00', '#00ff17', '#00ff3b', '#00ff5e',
    '#00ff82', '#00ffa6', '#00ffed', '#00edff', '#00c9ff', '#00a6ff', '#0082ff',
    '#005eff', '#003bff', '#0017ff', '#0b00ff', '#2f00ff', '#5300ff', '#7600ff', '#9a00ff',
    '#bd00ff', '#e100ff', '#ff00f9', '#ff00d5', '#ff00b1', '#ff008e', '#ff006a', '#ff0047',
    '#ff0023', '#000000'
  ];
  // ─── Swatch sizing ────────────────────────────────────────────────────────
    const SWATCH_GAP   = 6;  // px, must match the gap you set below
    const SWATCH_WIDTH = `calc((100% - ${(COLORS.length - 1) * SWATCH_GAP}px) / ${COLORS.length})`;
    
  let selectedColor = localStorage.getItem('galleryBgColor') || COLORS[0];

  // ─── Cached DOM References ─────────────────────────────────────────────────
  const gallery             = document.getElementById("gallery");
  const paginationContainer = document.getElementById("pagination");
  const modal               = document.getElementById('imageModal');
  const Box_1               = document.getElementById('Box_1');
  const Box_2               = document.getElementById('Box_2');
  const Box_3               = document.getElementById('Box_3');
  const Box_4               = document.getElementById('Box_4');

  // ─── Color Picker Row ──────────────────────────────────────────────────────
  function createColorRow() {
    const row = document.createElement('div');
    row.id                   = 'colorRow';
    row.style.display        = 'flex';
    row.style.justifyContent = 'center';
    row.style.alignItems     = 'center';
    row.style.width          = '100%';
    row.style.maxWidth       = '100%';
    row.style.boxSizing      = 'border-box';
    row.style.padding        = '8px';
    row.style.marginBottom   = '1rem';
    row.style.overflow       = 'hidden';
    row.style.flexWrap       = 'nowrap';    
    row.style.gap            = `${SWATCH_GAP}px`;
  
    COLORS.forEach(col => {
      const swatch = document.createElement('div');
      swatch.classList.add('color-swatch');
      swatch.dataset.color = col;
      swatch.title         = col;
      const totalGap = (COLORS.length - 1) * SWATCH_GAP;
      const swatchWidth = `calc((100% - ${totalGap}px) / ${COLORS.length})`;
      
      swatch.style.cssText = `
        background-color: ${col};
        width: ${swatchWidth};
        aspect-ratio: 1 / 1;                 /* keep squares */
        outline: 2px solid ${DEFAULT_BORDER_COLOR};
        cursor: pointer;
        border-radius: 4px;
        flex-shrink: 0;                      /* Prevent shrinkage */
      `;
      
      if (col === selectedColor) {
        swatch.style.outlineColor = SELECTED_BORDER_COLOR;
      }
      swatch.addEventListener('click', () => updateSelectedColor(col));
      row.appendChild(swatch);
    });
  
    // insert above gallery
    gallery.parentNode.insertBefore(row, gallery);
  }
  
  

  function updateSelectedColor(col) {
    selectedColor = col;
    localStorage.setItem('galleryBgColor', col);
    document.querySelectorAll('.color-swatch').forEach(s => {
      s.style.borderColor = (s.dataset.color === col)
        ? SELECTED_BORDER_COLOR
        : DEFAULT_BORDER_COLOR;
    });
    applyColorToGallery();
  }

  function applyColorToGallery() {
    document.querySelectorAll('.image-container').forEach(ic => {
      ic.style.backgroundColor = selectedColor;
    });
  }

  createColorRow();
  updateSelectedColor(selectedColor);

  // ─── Hover Effects for Modal Background ────────────────────────────────────
  Box_1.addEventListener('mouseover',  () => modal.style.backgroundColor = 'var(--box-bg1)');
  Box_1.addEventListener('mouseleave', () => modal.style.backgroundColor = '');
  Box_2.addEventListener('mouseover',  () => modal.style.backgroundColor = 'var(--box-bg2)');
  Box_2.addEventListener('mouseleave', () => modal.style.backgroundColor = '');
  Box_3.addEventListener('mouseover',  () => modal.style.backgroundColor = 'var(--box-bg3)');
  Box_3.addEventListener('mouseleave', () => modal.style.backgroundColor = '');
  Box_4.addEventListener('mouseover',  () => modal.style.backgroundColor = 'var(--box-bg4)');
  Box_4.addEventListener('mouseleave', () => modal.style.backgroundColor = '');

  // ─── Pagination & Image Rendering ─────────────────────────────────────────
  const imagesPerPage = 48;
  let   currentPage   = 1;
  let   totalPages    = 1;

  function displayImages() {
    fetch("gallery_index.dat")
      .then(r => r.text())
      .then(data => {
        const entries = data.trim().split("\n");
        if (!entries.length) return;

        gallery.innerHTML = "";
        const startIdx = (currentPage - 1) * imagesPerPage;
        const slice    = entries.slice(startIdx, startIdx + imagesPerPage);

        slice.forEach((fn, i) => {
          const wrapper = document.createElement("div");
          wrapper.classList.add("image-wrapper");

          const container = document.createElement("div");
          container.classList.add("image-container");
          container.id = `image-${i}`;

          const link = document.createElement("a");
          link.classList.add("image-link");
          const path = `${IMAGE_FOLDER}/${fn.trim()}`;
          link.addEventListener('click', e => {
            e.preventDefault();
            openModal(path);
          });

          const img = document.createElement("img");
          img.src = path;
          img.alt = fn.trim();

          link.appendChild(img);
          container.appendChild(link);
          wrapper.appendChild(container);

          const cap = document.createElement("div");
          cap.classList.add("caption-container");
          cap.textContent = fn.trim();
          wrapper.appendChild(cap);

          gallery.appendChild(wrapper);
        });

        totalPages = Math.ceil(entries.length / imagesPerPage);
        renderPagination();
        applyColorToGallery();
      })
      .catch(err => console.error("Error fetching images:", err));
  }

  function renderPagination() {
    paginationContainer.innerHTML = "";

    if (currentPage === 1) {
      const spacer = document.createElement("div");
      spacer.classList.add("spacer");
      paginationContainer.appendChild(spacer);
    }

    const prev = document.createElement("button");
    prev.id = "prevPage";
    prev.textContent = "⎗";
    prev.style.display = "inline-block";
    prev.classList.toggle("supress", currentPage === 1);
    prev.addEventListener("click", () => changePage(currentPage - 1));
    paginationContainer.appendChild(prev);

    for (let i = 1; i <= totalPages; i++) {
      const btn = document.createElement("button");
      btn.classList.add("page-link");
      btn.textContent = i < 10 ? `0${i}` : i;
      if (i === currentPage) btn.classList.add("active");
      btn.addEventListener("click", () => changePage(i));
      paginationContainer.appendChild(btn);
    }

    const next = document.createElement("button");
    next.id = "nextPage";
    next.textContent = "⎘";
    next.style.display = "inline-block";
    next.classList.toggle("supress", currentPage >= totalPages);
    next.addEventListener("click", () => changePage(currentPage + 1));
    paginationContainer.appendChild(next);
  }

  function changePage(page) {
    currentPage = Math.min(Math.max(1, page), totalPages);
    displayImages();
    history.pushState({ page: currentPage }, `Page ${currentPage}`, `?page=${currentPage}`);
  }

  window.onpopstate = e => {
    const pg = e.state?.page || 1;
    changePage(pg);
  };

  // Initial load
  currentPage = parseInt(new URLSearchParams(window.location.search).get('page'), 10) || 1;
  displayImages();
});

// ─── Modal Display ───────────────────────────────────────────────────────────
function openModal(imageSrc, bgColor) {
  const modal    = document.getElementById("imageModal");
  const modalImg = document.getElementById("modalImage");
  const span     = document.getElementsByClassName("close")[0];

  modal.style.backgroundColor = bgColor;  // Now using the passed color

  modal.style.display = "block";
  modalImg.src        = imageSrc;
  span.onclick        = () => modal.style.display = "none";
}
