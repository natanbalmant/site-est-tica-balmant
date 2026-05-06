



// Carousel
var _slide = 0;
var _total = 4;
var _timer = setInterval(nextSlide, 4000);

function goSlide(n) {
  _slide = n;
  document.getElementById('carouselTrack').style.transform = 'translateX(-' + (n * 25) + '%)';
  document.querySelectorAll('.cdot').forEach(function(d, i) {
    d.style.background = i === n ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.4)';
    d.style.width = i === n ? '22px' : '8px';
    d.style.borderRadius = '4px';
  });
  clearInterval(_timer);
  _timer = setInterval(nextSlide, 4000);
}
function nextSlide() { goSlide((_slide + 1) % _total); }
function prevSlide() { goSlide((_slide - 1 + _total) % _total); }

// ── CALENDÁRIO INTERATIVO ──────────────────────────────────────────
var calYear, calMonth, calSelDate = null, calSelTime = null;

function calInit() {
  var now = new Date();
  calYear = now.getFullYear();
  calMonth = now.getMonth();
  calRender();
}

function calNav(dir) {
  calMonth += dir;
  if (calMonth > 11) { calMonth = 0; calYear++; }
  if (calMonth < 0)  { calMonth = 11; calYear--; }
  calRender();
}

function calRender() {
  var months = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
  document.getElementById('calMonthLabel').textContent = months[calMonth] + ' ' + calYear;
  var grid = document.getElementById('calGrid');
  grid.innerHTML = '';
  var today = new Date(); today.setHours(0,0,0,0);
  var first = new Date(calYear, calMonth, 1).getDay();
  var daysInMonth = new Date(calYear, calMonth+1, 0).getDate();
  // blanks
  for (var i = 0; i < first; i++) {
    var blank = document.createElement('div'); blank.style.cssText=''; grid.appendChild(blank);
  }
  for (var d = 1; d <= daysInMonth; d++) {
    var dt = new Date(calYear, calMonth, d);
    var dow = dt.getDay(); // 0=sun,6=sat
    var isPast = dt < today;
    var isSun = dow === 0;
    var dateStr = calYear + '-' + String(calMonth+1).padStart(2,'0') + '-' + String(d).padStart(2,'0');
    var isSelected = calSelDate === dateStr;
    var btn = document.createElement('button');
    btn.textContent = d;
    btn.disabled = isPast || isSun;
    btn.dataset.date = dateStr;
    var base = 'width:100%;aspect-ratio:1/1;border-radius:50%;border:none;font-family:DM Sans,sans-serif;font-size:0.78rem;cursor:pointer;transition:all .15s;';
    if (isPast || isSun) {
      btn.style.cssText = base + 'background:transparent;color:#ccc;cursor:default;';
    } else if (isSelected) {
      btn.style.cssText = base + 'background:#C9867A;color:white;font-weight:600;';
    } else if (dow === 6) {
      btn.style.cssText = base + 'background:var(--rose-light);color:var(--rose-dark);';
    } else {
      btn.style.cssText = base + 'background:transparent;color:var(--mid);';
      btn.onmouseover = function(){ if(!this.disabled) this.style.background='var(--rose-light)'; };
      btn.onmouseout  = function(){ if(!this.disabled && calSelDate !== this.dataset.date) this.style.background='transparent'; };
    }
    btn.onclick = function() {
      calSelDate = this.dataset.date;
      calSelTime = null;
      document.getElementById('data').value = calSelDate;
      document.getElementById('horario').value = '';
      calRender();
      showTimeSlots(calSelDate);
    };
    grid.appendChild(btn);
  }
}

function showTimeSlots(dateStr) {
  var dt = new Date(dateStr + 'T00:00:00');
  var dow = dt.getDay();
  var allSlots = dow === 6
    ? ['09:00','10:00','11:00','12:00']
    : ['09:00','10:00','11:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00'];

  // Se for hoje, filtrar horários com mínimo 1h à frente
  var now = new Date();
  var todayStr = now.getFullYear() + '-' +
    String(now.getMonth()+1).padStart(2,'0') + '-' +
    String(now.getDate()).padStart(2,'0');
  if (dateStr === todayStr) {
    var minHour = now.getHours() + 1;
    var minMin  = now.getMinutes();
    allSlots = allSlots.filter(function(t) {
      var parts = t.split(':');
      var slotH = parseInt(parts[0]);
      var slotM = parseInt(parts[1]);
      return slotH > minHour || (slotH === minHour && slotM >= minMin);
    });
  }

  var months = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];
  var parts = dateStr.split('-');
  document.getElementById('selectedDateLabel').textContent =
    parseInt(parts[2]) + ' de ' + months[parseInt(parts[1])-1];
  var wrap = document.getElementById('timeSlotsWrap');
  wrap.style.display = 'block';
  var container = document.getElementById('timeSlots');
  container.innerHTML = '';

  if (allSlots.length === 0) {
    container.innerHTML = '<p style="font-size:0.82rem;color:var(--muted);padding:0.5rem 0;">Não há mais horários disponíveis para hoje. Por favor, escolha outro dia.</p>';
    if (calSelTime) { calSelTime = null; document.getElementById('horario').value = ''; }
    return;
  }

  allSlots.forEach(function(t) {
    var btn = document.createElement('button');
    btn.textContent = t;
    var isSelT = calSelTime === t;
    btn.style.cssText = 'padding:0.4rem 0.75rem;border-radius:2px;border:1px solid '+(isSelT?'var(--rose)':'var(--border)')+';background:'+(isSelT?'var(--rose)':'var(--white)')+';color:'+(isSelT?'white':'var(--mid)')+';font-size:0.8rem;cursor:pointer;font-family:DM Sans,sans-serif;transition:all .15s;';
    btn.onmouseover = function(){ if(calSelTime!==this.textContent){this.style.background='var(--rose-light)';this.style.borderColor='var(--rose)';} };
    btn.onmouseout  = function(){ if(calSelTime!==this.textContent){this.style.background='var(--white)';this.style.borderColor='var(--border)';} };
    btn.onclick = function() {
      calSelTime = this.textContent;
      document.getElementById('horario').value = calSelTime;
      showTimeSlots(calSelDate);
    };
    container.appendChild(btn);
  });
}

calInit();
// ── FIM CALENDÁRIO ──────────────────────────────────────────────────

// Carousel
var _slide = 0;
var _total = 4;
var _timer = setInterval(nextSlide, 4000);

function goSlide(n) {
  _slide = n;
  document.getElementById('carouselTrack').style.transform = 'translateX(-' + (n * 25) + '%)';
  document.querySelectorAll('.cdot').forEach(function(d, i) {
    d.style.background = i === n ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.4)';
    d.style.width = i === n ? '22px' : '8px';
    d.style.borderRadius = '4px';
  });
  clearInterval(_timer);
  _timer = setInterval(nextSlide, 4000);
}
function nextSlide() { goSlide((_slide + 1) % _total); }
function prevSlide() { goSlide((_slide - 1 + _total) % _total); }

// Fade in observer
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.1 });
document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

// Set min date to today
const dateInput = document.getElementById('data');
if (dateInput) {
  const today = new Date().toISOString().split('T')[0];
  dateInput.min = today;
}

// Form submission
function submitForm() {
  const servico = document.getElementById('servico').value;
  const data = document.getElementById('data').value;
  const horario = document.getElementById('horario').value;

  if (!servico) { alert('Por favor, selecione o serviço desejado.'); return; }
  if (!data) { alert('Por favor, selecione uma data no calendário.'); return; }
  if (!horario) { alert('Por favor, selecione um horário.'); return; }

  // Preenche resumo no modal
  var months = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];
  var parts = data.split('-');
  var dataFmt = parseInt(parts[2]) + ' de ' + months[parseInt(parts[1])-1] + ' de ' + parts[0];
  document.getElementById('cmServico').textContent = servico.split(' — ')[0];
  document.getElementById('cmData').textContent = dataFmt;
  document.getElementById('cmHorario').textContent = horario;
  document.getElementById('cmNome').value = '';
  document.getElementById('cmTel').value = '';

  document.getElementById('contactModalOverlay').classList.add('open');
}

function closeContactModal() {
  document.getElementById('contactModalOverlay').classList.remove('open');
}

function finalConfirm() {
  const nome = document.getElementById('cmNome').value.trim();
  const tel = document.getElementById('cmTel').value.trim();
  const servico = document.getElementById('servico').value;
  const data = document.getElementById('data').value;
  const horario = document.getElementById('horario').value;
  if (!nome) { document.getElementById('cmNome').focus(); return; }
  if (!tel) { document.getElementById('cmTel').focus(); return; }

  // Monta mensagem WhatsApp
  var months = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];
  var parts = data.split('-');
  var dataFmt = parseInt(parts[2]) + ' de ' + months[parseInt(parts[1])-1] + ' de ' + parts[0];
  var msg = 'Olá, Adriane! Gostaria de confirmar meu agendamento:%0A%0A'
          + '*Nome:* ' + encodeURIComponent(nome) + '%0A'
          + '*Telefone:* ' + encodeURIComponent(tel) + '%0A'
          + '*Serviço:* ' + encodeURIComponent(servico.split(' — ')[0]) + '%0A'
          + '*Data:* ' + encodeURIComponent(dataFmt) + '%0A'
          + '*Horário:* ' + encodeURIComponent(horario) + '%0A%0A'
          + 'Agendamento feito pelo site. Aguardo confirmação!';

  document.getElementById('contactModalOverlay').classList.remove('open');
  document.getElementById('formContent').style.display = 'none';
  document.getElementById('successMsg').classList.add('show');

  // Abre WhatsApp
  setTimeout(function() {
    window.open('https://wa.me/5516999952584?text=' + msg, '_blank');
  }, 600);
}

// Mobile menu toggle
function toggleMenu() {
  const nav = document.querySelector('.nav-links');
  if (nav.style.display === 'flex') {
    nav.style.display = '';
  } else {
    nav.style.cssText = 'display:flex; flex-direction:column; position:absolute; top:70px; left:0; right:0; background:rgba(250,247,242,0.97); padding:1.5rem 2rem; gap:1rem; border-bottom:1px solid rgba(201,134,122,0.2); z-index:99;';
  }
}

// Smooth phone mask
function maskPhone(el) {
  let v = el.value.replace(/\D/g, '');
  if (v.length > 11) v = v.slice(0, 11);
  if (v.length > 7) v = '(' + v.slice(0,2) + ') ' + v.slice(2,7) + '-' + v.slice(7);
  else if (v.length > 2) v = '(' + v.slice(0,2) + ') ' + v.slice(2);
  else if (v.length > 0) v = '(' + v;
  el.value = v;
}
function maskTelCm(el) { maskPhone(el); }
const telInput = document.getElementById('tel');
if (telInput) {
if (telInput) telInput.addEventListener('input', function() { maskPhone(this); });
}
