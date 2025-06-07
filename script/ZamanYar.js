document.querySelectorAll('input.ZamanYar').forEach(input => {
  input.setAttribute('readonly', true);
});

(() => {
  const styleContent = `
  .ZamanYar {
    caret-color: transparent;
    cursor: pointer;
    user-select: none;
    box-sizing: border-box;
  }

  .time-container {
    position: relative;
    max-width: 360px;
  }
  .time-picker {
    position: absolute;
    top: 70px;
    right: 0;
    left: 0;
    margin: auto;
    background: white;
    border-radius: 16px;
    box-shadow: 0 8px 20px rgba(0,0,0,0.1);
    padding: 20px;
    display: none;
    z-index: 9999;
    user-select: none;
    width: clamp(220px, 100%, 280px);
    box-sizing: border-box;
  }
  .picker-row {
    display: flex;
    justify-content: center;
    gap: 40px;
    margin-bottom: 16px;
    direction: ltr;
  }
  .picker-section {
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 80px;
  }
  .picker-section button.arrow-btn {
    width: 40px;
    height: 40px;
    border: none;
    background: transparent;
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    transition: background-color 0.2s;
    border-radius: 50%;
    margin-bottom: 6px;
  }
  .picker-section button.arrow-btn:hover {
    background: #e0f2fe;
  }
  .picker-section svg {
    width: 24px;
    height: 24px;
    fill: #5271ff;
    transition: fill 0.2s;
  }
  .picker-section button.arrow-btn:hover svg {
    fill: #5271ff;
  }
  .value {
    font-size: 36px;
    font-weight: bold;
    margin-bottom: 6px;
    user-select: none;
  }
  .label {
    font-size: 16px;
    color: #555;
  }
  #set-time {
    width: 100%;
    padding: 12px 0;
    background: #5271ff;
    border: none;
    color: white;
    font-size: 18px;
    border-radius: 12px;
    cursor: pointer;
    transition: background-color 0.3s;
  }
  #set-time:hover {
    background: #5272ffd8;
  }
  @media (max-width: 400px) {
    .time-container {
      max-width: 100%;
    }
    .time-picker {
      width: 20%;
      min-width: 220px;
      padding: 16px;
      border-radius: 12px;
      box-shadow: 0 5px 15px rgba(0,0,0,0.15);
      top: 60px;
    }
    .picker-row {
      gap: 24px;
    }
    .picker-section {
      width: 60px;
    }
    .value {
      font-size: 28px;
      margin-bottom: 4px;
    }
    .label {
      font-size: 14px;
    }
    .picker-section button.arrow-btn {
      width: 32px;
      height: 32px;
      margin-bottom: 4px;
    }
    .picker-section svg {
      width: 18px;
      height: 18px;
    }
    #set-time {
      font-size: 16px;
      padding: 10px 0;
      border-radius: 10px;
    }
  }
  `;

  const styleTag = document.createElement('style');
  styleTag.textContent = styleContent;
  document.head.appendChild(styleTag);

  class TimePicker {
    constructor(input) {
      this.input = input;
      this.createPicker();
      this.attachEvents();
      this.hidePicker();
    }

    createPicker() {
      // ساختار کانتینر و تایم پیکر
      const container = document.createElement('div');
      container.classList.add('time-container');
      this.input.parentNode.insertBefore(container, this.input);
      container.appendChild(this.input);

      this.picker = document.createElement('div');
      this.picker.classList.add('time-picker');
      this.picker.innerHTML = `
        <div class="picker-row">
          <div class="picker-section" dir="rtl" style="order: 1;">
            <button class="arrow-btn" aria-label="ساعت بالا" data-action="hour-up">
              <svg viewBox="0 0 24 24"><path d="M7 14l5-5 5 5z"/></svg>
            </button>
            <div class="value" id="hour-value">00</div>
            <button class="arrow-btn" aria-label="ساعت پایین" data-action="hour-down">
              <svg viewBox="0 0 24 24"><path d="M7 10l5 5 5-5z"/></svg>
            </button>
            <div class="label">ساعت</div>
          </div>
          <div class="picker-section" dir="rtl" style="order: 2;">
            <button class="arrow-btn" aria-label="دقیقه بالا" data-action="minute-up">
              <svg viewBox="0 0 24 24"><path d="M7 14l5-5 5 5z"/></svg>
            </button>
            <div class="value" id="minute-value">00</div>
            <button class="arrow-btn" aria-label="دقیقه پایین" data-action="minute-down">
              <svg viewBox="0 0 24 24"><path d="M7 10l5 5 5-5z"/></svg>
            </button>
            <div class="label">دقیقه</div>
          </div>
        </div>
        <button id="set-time" type="button">تایید</button>
      `;
      container.appendChild(this.picker);

      this.hourValue = this.picker.querySelector('#hour-value');
      this.minuteValue = this.picker.querySelector('#minute-value');
      this.setTimeBtn = this.picker.querySelector('#set-time');
    }

    attachEvents() {
      // باز کردن تایم پیکر با کلیک روی اینپوت
      this.input.addEventListener('click', () => {
        this.showPicker();
        this.loadTime();
      });

      // بستن تایم پیکر با کلیک بیرون از آن یا اینپوت
      document.addEventListener('click', (e) => {
        if (!this.picker.contains(e.target) && e.target !== this.input) {
          this.hidePicker();
        }
      });

      // مدیریت کلیک روی دکمه‌های ساعت و دقیقه
      this.picker.addEventListener('click', (e) => {
        const btn = e.target.closest('button.arrow-btn');
        if (!btn) return;
        const action = btn.getAttribute('data-action');
        switch (action) {
          case 'hour-up': this.changeHour(1); break;
          case 'hour-down': this.changeHour(-1); break;
          case 'minute-up': this.changeMinute(1); break;
          case 'minute-down': this.changeMinute(-1); break;
        }
      });

      // دکمه تایید ساعت
      this.setTimeBtn.addEventListener('click', () => {
        this.setTime();
        this.hidePicker();
      });
    }

    showPicker() {
      this.picker.style.display = 'block';
    }

    hidePicker() {
      this.picker.style.display = 'none';
    }

    loadTime() {
      fetch('https://worldtimeapi.org/api/timezone/Asia/Tehran')
        .then(res => {
          if (!res.ok) throw new Error('API error');
          return res.json();
        })
        .then(data => {
          const datetime = data.datetime;
          const timePart = datetime.split('T')[1].split('.')[0];
          const [h, m] = timePart.split(':');
          this.hourValue.textContent = h.padStart(2, '0');
          this.minuteValue.textContent = m.padStart(2, '0');
        })
        .catch(() => {
          const now = new Date();
          this.hourValue.textContent = String(now.getHours()).padStart(2, '0');
          this.minuteValue.textContent = String(now.getMinutes()).padStart(2, '0');
        });
    }

    changeHour(amount) {
      let hour = parseInt(this.hourValue.textContent);
      hour = (hour + amount + 24) % 24;
      this.hourValue.textContent = hour.toString().padStart(2, '0');
    }

    changeMinute(amount) {
      let minute = parseInt(this.minuteValue.textContent);
      minute = (minute + amount + 60) % 60;
      this.minuteValue.textContent = minute.toString().padStart(2, '0');
    }

    setTime() {
      const h = this.hourValue.textContent;
      const m = this.minuteValue.textContent;
      this.input.value = `${h}:${m}`;
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('input.ZamanYar').forEach(input => {
      new TimePicker(input);
    });
  });
})();
