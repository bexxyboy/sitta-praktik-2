// =============================================
// SITTA UT — TRACKING APP (Vue.js)
// Halaman Tracking Delivery Order
// =============================================

var trackingApp = new Vue({
  el: '#tracking-app',

  data: {
    // ── Auth ─────────────────────────────────
    currentUser: null,

    // ── Data ─────────────────────────────────
    pengirimanList: pengirimanList,
    paketList: paketList,

    // Tracking store: clone dari global agar bisa ditambah tanpa ubah global
    trackingStore: Object.assign({}, dataTracking),

    // ── Search ───────────────────────────────
    inputDO: '',
    hasilTracking: null,
    alertMsg: '',
    alertType: 'danger',

    // ── Form DO Baru ─────────────────────────
    showFormDO: false,
    formDO: {
      nim: '', nama: '', ekspedisi: '', paket: '', tanggalKirim: ''
    },
    errDO: {},
    alertDO: '',

    // ── Watcher helpers ───────────────────────
    lastSearchDO: '',
    toast: { show: false, msg: '', type: 'success' },
  },

  // ============================================
  // COMPUTED PROPERTIES
  // ============================================
  computed: {
    /** Generate nomor DO otomatis */
    nomorDOBaru() {
      const tahun = new Date().getFullYear();
      const prefix = `DO${tahun}-`;
      const existing = Object.keys(this.trackingStore)
        .filter(k => k.startsWith(prefix))
        .map(k => parseInt(k.replace(prefix, '')) || 0);
      const next = existing.length > 0 ? Math.max(...existing) + 1 : 1;
      return `${prefix}${String(next).padStart(3, '0')}`;
    },

    /** Detail paket yang dipilih pada form DO */
    selectedPaketDetail() {
      if (!this.formDO.paket) return null;
      return this.paketList.find(p => p.kode === this.formDO.paket) || null;
    },

    /** Total harga dari paket yang dipilih */
    totalHargaDO() {
      return this.selectedPaketDetail ? this.selectedPaketDetail.harga : 0;
    },

    /** List semua DO untuk tabel riwayat */
    listSemuaDO() {
      return Object.values(this.trackingStore);
    },

    /** Hint chips: ambil 4 nomor DO pertama */
    hintDOList() {
      return Object.keys(this.trackingStore).slice(0, 4);
    },

    /** Progress steps dari hasil tracking */
    progressSteps() {
      const steps = [
        { label: 'Diterima',     icon: '📬' },
        { label: 'Di Hub',       icon: '🏭' },
        { label: 'Transit',      icon: '🚛' },
        { label: 'Kota Tujuan',  icon: '🏙️' },
        { label: 'Proses Antar', icon: '🚚' },
        { label: 'Terkirim',     icon: '✅' },
      ];
      if (!this.hasilTracking) return steps.map((s, i) => ({ ...s, kelas: '', nomor: i + 1 }));
      const current = this.hasilTracking.perjalanan.length;
      return steps.map((s, i) => {
        let kelas = '';
        if (i < current - 1) kelas = 'done';
        else if (i === current - 1) kelas = 'current';
        return { ...s, kelas, nomor: i + 1 };
      });
    },

    /** Timeline perjalanan dibalik (terbaru di atas) */
    timelineReversed() {
      if (!this.hasilTracking) return [];
      return [...this.hasilTracking.perjalanan].reverse().map((p, i) => ({
        ...p,
        kelas: i === 0 ? (this.hasilTracking.status === 'Dikirim' ? 'done' : 'current') : 'done'
      }));
    }
  },

  // ============================================
  // WATCHERS
  // ============================================
  watch: {
    /**
     * Watcher 1: Pantau inputDO.
     * Bersihkan hasil saat input berubah, cari otomatis jika isi penuh.
     */
    inputDO(val) {
      if (val !== this.lastSearchDO) {
        this.hasilTracking = null;
        this.alertMsg = '';
      }
    },

    /**
     * Watcher 2: Pantau paket yang dipilih pada form DO.
     * Tampilkan notifikasi harga saat paket berganti.
     */
    'formDO.paket'(val) {
      if (val) {
        const p = this.paketList.find(x => x.kode === val);
        if (p) {
          this.showToast(`📦 Paket "${p.nama}" — ${this.formatRupiah(p.harga)}`, 'info');
        }
      }
    },

    /**
     * Watcher 3: Pantau jumlah DO di store.
     * Beri notifikasi jika ada DO baru ditambahkan.
     */
    trackingStore: {
      deep: true,
      handler(val) {
        // Hanya untuk feedback pasif; logika utama di method simpanDO
      }
    },

    /**
     * Watcher 4: Pantau hasil tracking.
     * Scroll ke hasil setelah ditemukan.
     */
    hasilTracking(val) {
      if (val) {
        this.$nextTick(() => {
          const el = document.getElementById('trackingResult');
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
      }
    }
  },

  // ============================================
  // METHODS
  // ============================================
  methods: {
    // ── Auth ─────────────────────────────────
    initAuth() {
      const raw = sessionStorage.getItem('user');
      if (!raw) { window.location.href = 'index.html'; return; }
      this.currentUser = JSON.parse(raw);
    },

    doLogout() {
      if (confirm('Keluar dari SITTA?')) {
        sessionStorage.removeItem('user');
        window.location.href = 'index.html';
      }
    },

    getInitial(nama) { return (nama || 'U')[0].toUpperCase(); },

    // ── Format ───────────────────────────────
    formatRupiah(num) {
      return 'Rp ' + Number(num).toLocaleString('id-ID');
    },

    // ── Search DO ────────────────────────────
    cariTracking() {
      const no = this.inputDO.trim();
      this.alertMsg = '';
      this.hasilTracking = null;

      if (!no) {
        this.alertMsg  = '⚠️ Masukkan nomor Delivery Order terlebih dahulu.';
        this.alertType = 'danger';
        return;
      }

      const data = this.trackingStore[no];
      if (!data) {
        this.alertMsg  = `⚠️ Nomor DO "${no}" tidak ditemukan dalam sistem.`;
        this.alertType = 'danger';
        return;
      }

      this.lastSearchDO  = no;
      this.hasilTracking = data;
    },

    fillDO(val) {
      this.inputDO = val;
      this.cariTracking();
    },

    statusBadgeKelas(status) {
      return status === 'Dikirim' ? 'badge-success' : 'badge-warning';
    },

    statusIcon(status) {
      return status === 'Dikirim' ? '✅' : '🚚';
    },

    // ── Form DO Baru ─────────────────────────
    bukaFormDO() {
      const today = new Date().toISOString().split('T')[0];
      this.formDO  = { nim: '', nama: '', ekspedisi: '', paket: '', tanggalKirim: today };
      this.errDO   = {};
      this.alertDO = '';
      this.showFormDO = true;
    },

    tutupFormDO() {
      this.showFormDO = false;
    },

    validasiFormDO() {
      const e = {};
      const f = this.formDO;
      if (!f.nim.trim())        e.nim        = 'NIM wajib diisi';
      else if (!/^\d{6,12}$/.test(f.nim.trim())) e.nim = 'NIM harus 6–12 digit angka';
      if (!f.nama.trim())       e.nama       = 'Nama wajib diisi';
      if (!f.ekspedisi)         e.ekspedisi  = 'Pilih jenis ekspedisi';
      if (!f.paket)             e.paket      = 'Pilih paket bahan ajar';
      if (!f.tanggalKirim)      e.tanggalKirim = 'Tanggal kirim wajib diisi';
      this.errDO = e;
      return Object.keys(e).length === 0;
    },

    simpanDO() {
      if (!this.validasiFormDO()) return;
      const f = this.formDO;
      const nomorBaru = this.nomorDOBaru;
      const paketObj   = this.paketList.find(p => p.kode === f.paket);
      const ekspObj    = this.pengirimanList.find(p => p.kode === f.ekspedisi);

      const now = new Date();
      const waktuNow = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}`;

      const newDO = {
        nomorDO:      nomorBaru,
        nim:          f.nim.trim(),
        nama:         f.nama.trim(),
        status:       'Dalam Perjalanan',
        ekspedisi:    f.ekspedisi,
        namaEkspedisi: ekspObj ? ekspObj.nama : f.ekspedisi,
        tanggalKirim: f.tanggalKirim,
        paket:        f.paket,
        namaPaket:    paketObj ? paketObj.nama : f.paket,
        total:        paketObj ? paketObj.harga : 0,
        perjalanan: [
          { waktu: waktuNow, keterangan: 'Penerimaan di Loket: PUSAT. Pengirim: Universitas Terbuka' }
        ]
      };

      // Reactivity: gunakan Vue.set agar objek baru terdeteksi oleh Vue
      Vue.set(this.trackingStore, nomorBaru, newDO);

      this.showFormDO = false;
      this.showToast(`✅ DO ${nomorBaru} berhasil dibuat!`, 'success');

      // Langsung tampilkan hasil tracking DO baru
      this.inputDO = nomorBaru;
      this.$nextTick(() => this.cariTracking());
    },

    // ── Toast ────────────────────────────────
    showToast(msg, type = 'success') {
      this.toast = { show: true, msg, type };
      setTimeout(() => { this.toast.show = false; }, 3400);
    }
  },

  // ============================================
  // LIFECYCLE
  // ============================================
  mounted() {
    this.initAuth();

    // Auto-fill dari URL param
    const params = new URLSearchParams(window.location.search);
    if (params.get('do')) {
      this.inputDO = params.get('do');
      this.$nextTick(() => this.cariTracking());
    }
  }
});
