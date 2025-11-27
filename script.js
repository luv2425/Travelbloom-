/* ---------- Data ---------- */
const DESTINATIONS = [
    {
      id: 'bali',
      name: 'Bali',
      country: 'Indonesia',
      climate: 'tropical',
      budget: 'mid',
      activity: 'beach',
      images: [
        'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=60',
        'https://images.unsplash.com/photo-1518684079-5b5f5d3f2f7a?w=1200&q=60'
      ],
      description: 'Bali is a tropical island paradise with beaches, rice terraces and temples.',
      highlights: ['Beaches & surf','Temple visits','Balinese cuisine']
    },
    {
      id:'iceland',
      name:'Iceland',
      country:'Iceland',
      climate:'cold',
      budget:'high',
      activity:'hiking',
      images:[
        'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1200&q=60',
        'https://images.unsplash.com/photo-1479899769602-7a9b4c9f0b98?w=1200&q=60'
      ],
      description:'Iceland offers dramatic landscapes—glaciers, volcanoes and northern lights.',
      highlights:['Glaciers','Hot springs','Northern Lights']
    },
    {
      id:'lisbon',
      name:'Lisbon',
      country:'Portugal',
      climate:'temperate',
      budget:'mid',
      activity:'culture',
      images:[
        'https://images.unsplash.com/photo-1508057198894-247b23fe5ade?w=1200&q=60',
        'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1200&q=60'
      ],
      description:'Lisbon is a colorful city with historic neighborhoods and great food.',
      highlights:['Historic neighborhoods','Food & cafés','Sea views']
    },
    {
      id:'maasai',
      name:'Maasai Mara',
      country:'Kenya',
      climate:'arid',
      budget:'high',
      activity:'wildlife',
      images:[
        'https://images.unsplash.com/photo-1549880338-65ddcdfd017b?w=1200&q=60',
        'https://images.unsplash.com/photo-1508780709619-79562169bc64?w=1200&q=60'
      ],
      description:'A premier safari destination with dramatic wildlife encounters.',
      highlights:['Safari','Big Five','Migration']
    }
  ];
  
  /* ---------- DOM references ---------- */
  const resultsEl = document.getElementById('results');
  const climateEl = document.getElementById('climate');
  const budgetEl = document.getElementById('budget');
  const activityEl = document.getElementById('activity');
  const searchEl = document.getElementById('search');
  const searchBtn = document.getElementById('searchBtn');
  const clearBtn = document.getElementById('clearBtn');
  const recommendBtn = document.getElementById('recommendBtn');
  const resetFilters = document.getElementById('resetFilters');
  
  const favoritesEl = document.getElementById('favorites');
  
  const modal = document.getElementById('modal');
  const modalTitle = document.getElementById('modalTitle');
  const modalSub = document.getElementById('modalSub');
  const modalDesc = document.getElementById('modalDesc');
  const modalHigh = document.getElementById('modalHigh');
  const modalBudget = document.getElementById('modalBudget');
  const modalClimate = document.getElementById('modalClimate');
  const modalActivity = document.getElementById('modalActivity');
  const carousel = document.getElementById('carousel');
  const modalVideo = document.getElementById('modalVideo');
  const modalClose = document.getElementById('modalClose');
  
  /* ---------- State ---------- */
  let filtered = [...DESTINATIONS];
  let favorites = JSON.parse(localStorage.getItem('tb_favorites') || '[]');
  
  /* ---------- Helpers ---------- */
  function saveFavs(){
    localStorage.setItem('tb_favorites', JSON.stringify(favorites));
    renderFavs();
  }
  function renderFavs(){
    favoritesEl.innerHTML = '';
    if(!favorites.length){
      favoritesEl.innerHTML = '<div class="muted small">No favorites yet. Save destinations to quickly access them here.</div>';
      return;
    }
    favorites.forEach(f=>{
      const div = document.createElement('div'); div.className = 'fav-item';
      div.innerHTML = `<div style="width:44px;height:44px;border-radius:8px;background:#eee;display:flex;align-items:center;justify-content:center;font-weight:700">${f.name.charAt(0)}</div>
        <div style="flex:1"><strong>${f.name}</strong><div class="small muted">${f.country}</div></div>
        <div><button class="btn ghost" data-remove="${f.id}">Remove</button></div>`;
      favoritesEl.appendChild(div);
      div.querySelector('[data-remove]').addEventListener('click', ()=>{
        favorites = favorites.filter(x=>x.id!==f.id); saveFavs();
      });
    });
  }
  
  function renderCards(list){
    resultsEl.innerHTML = '';
    if(!list.length){
      resultsEl.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--muted)">No destinations found. Try different filters.</div>';
      return;
    }
    list.forEach(d=>{
      const el = document.createElement('article'); el.className='card';
      el.innerHTML = `
        <img src="${d.images[0]}" alt="${d.name}" loading="lazy" />
        <div class="body">
          <div class="meta"><div class="small muted">${d.country}</div><div class="pill">${d.activity.toUpperCase()}</div></div>
          <h3>${d.name}</h3>
          <p class="muted small">${d.description}</p>
          <div style="display:flex;gap:8px;margin-top:10px">
            <button class="btn" data-open="${d.id}">View</button>
            <button class="btn ghost" data-save="${d.id}">Save</button>
          </div>
        </div>
      `;
      resultsEl.appendChild(el);
  
      el.querySelector('[data-open]').addEventListener('click', ()=> openModal(d.id));
      el.querySelector('[data-save]').addEventListener('click', ()=>{
        if(!favorites.find(f=>f.id===d.id)){
          favorites.push({id:d.id,name:d.name,country:d.country,thumb:d.images[0]});
          saveFavs();
        }
      });
    });
  }
  
  /* ---------- Filters & Search ---------- */
  function applyFilters(){
    const climate = climateEl.value;
    const budget = budgetEl.value;
    const activity = activityEl.value;
    const q = (searchEl.value || '').trim().toLowerCase();
  
    filtered = DESTINATIONS.filter(d=>{
      if(climate!=='any' && d.climate !== climate) return false;
      if(budget!=='any' && d.budget !== budget) return false;
      if(activity!=='any' && d.activity !== activity) return false;
      if(q){
        const hay = (d.name + ' ' + d.country + ' ' + d.description).toLowerCase();
        if(!hay.includes(q)) return false;
      }
      return true;
    });
    renderCards(filtered);
  }
  
  /* ---------- Recommend algorithm (simple scoring) ---------- */
  function recommend(){
    const cov = {climate:climateEl.value,budget:budgetEl.value,activity:activityEl.value,query:searchEl.value.trim()};
    const scored = DESTINATIONS.map(d=>{
      let score = 0;
      if(cov.climate!=='any' && d.climate === cov.climate) score+=3;
      if(cov.budget!=='any' && d.budget === cov.budget) score+=2;
      if(cov.activity!=='any' && d.activity === cov.activity) score+=4;
      if(cov.query && (d.name.toLowerCase().includes(cov.query.toLowerCase()))) score += 2;
      if(d.budget === 'mid') score += 0.5;
      return {...d,score};
    });
    scored.sort((a,b)=>b.score - a.score);
    if(scored[0].score <= 0){
      alert('No strong match found — showing popular picks.');
      renderCards(scored.slice(0,3));
      return;
    }
    renderCards([scored[0], ...scored.slice(1,5)]);
    setTimeout(()=> openModal(scored[0].id), 220);
  }
  
  /* ---------- Modal ---------- */
  function openModal(id){
    const d = DESTINATIONS.find(x=>x.id===id);
    if(!d) return;
    modalTitle.textContent = d.name;
    modalSub.textContent = `${d.country}`;
    modalDesc.textContent = d.description;
    modalBudget.textContent = d.budget === 'low'? 'Low' : d.budget==='mid'? 'Moderate' : 'High';
    modalClimate.textContent = d.climate.charAt(0).toUpperCase() + d.climate.slice(1);
    modalActivity.textContent = d.activity.charAt(0).toUpperCase() + d.activity.slice(1);
    modalHigh.innerHTML = '';
    d.highlights.forEach(h=> { const li = document.createElement('li'); li.textContent = h; modalHigh.appendChild(li); });
  
    carousel.innerHTML = '';
    d.images.forEach(url=>{
      const im = document.createElement('img'); im.src = url; im.alt = d.name; carousel.appendChild(im);
    });
  
    modalVideo.innerHTML = '';
  
    modal.style.display = 'flex'; modal.setAttribute('aria-hidden','false');
    document.body.style.overflow = 'hidden';
  }
  
  function closeModal(){
    modal.style.display = 'none'; modal.setAttribute('aria-hidden','true'); document.body.style.overflow = '';
  }
  
  /* ---------- Init ---------- */
  renderCards(DESTINATIONS);
  renderFavs();
  
  /* ---------- Event listeners ---------- */
  searchBtn.addEventListener('click', applyFilters);
  clearBtn.addEventListener('click', ()=> { searchEl.value=''; applyFilters(); });
  [climateEl,budgetEl,activityEl].forEach(sel=> sel.addEventListener('change', applyFilters));
  resetFilters.addEventListener('click', ()=> {
    climateEl.value='any';
    budgetEl.value='any';
    activityEl.value='any';
    searchEl.value='';
    applyFilters();
  });
  
  recommendBtn.addEventListener('click', recommend);
  
  modalClose.addEventListener('click', closeModal);
  modal.addEventListener('click', (e)=> { if(e.target === modal) closeModal(); });
  
  document.addEventListener('keydown', (e)=> {
    if(e.key === 'Escape') closeModal();
  });
  
  /* Accessibility: smooth scroll for nav links */
  document.querySelectorAll('nav.topnav a').forEach(a=>{
    a.addEventListener('click', (e)=>{
      const href = a.getAttribute('href');
      if(!href || !href.startsWith('#')) return;
      e.preventDefault();
      const id = href.slice(1);
      const el = document.getElementById(id);
      if(el) el.scrollIntoView({behavior:'smooth',block:'start'});
    });
  });
  
  /* Simple contact form handler */
  const contactForm = document.getElementById('contactForm');
  contactForm.addEventListener('submit', (e)=>{
    e.preventDefault();
    alert('Thank you for contacting TravelBloom!');
    contactForm.reset();
  });
  