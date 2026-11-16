
var TEMPLATES = ["status-badge", "app-modal", "login-form", "stock-table", "do-tracking", "order-form"];

var app = new Vue({
  el: "#app",
  data: {
    ready: false,
    user: null,
    tab: "home",          
    navOpen: false,
    notice: "",
    state: { upbjjList: [], kategoriList: [], pengirimanList: [], paket: [], stok: [], tracking: {} }
  },
  computed: {
    sapaan: function () {
      var j = new Date().getHours();
      return j < 11 ? "Selamat pagi" : j < 15 ? "Selamat siang" : j < 18 ? "Selamat sore" : "Selamat malam";
    },
    tanggalHariIni: function () { return new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" }); },
    
    statistik: function () {
      var st = this.state.stok;
      return {
        judul: st.length,
        stok: st.reduce(function (t, s) { return t + s.qty; }, 0),
        do: Object.keys(this.state.tracking).length,
        menipis: st.filter(function (s) { return s.qty < s.safety; }).length
      };
    },
    
    nomorDOBaru: function () {
      var maks = 0;
      Object.keys(this.state.tracking).forEach(function (k) {
        var m = /^DO\d{4}-(\d+)$/.exec(k);
        if (m) maks = Math.max(maks, parseInt(m[1], 10));
      });
      return "DO" + new Date().getFullYear() + "-" + String(maks + 1).padStart(3, "0");
    }
  },
  watch: {
    
    notice: function (v) {
      var self = this;
      if (!v) return;
      clearTimeout(this._t);
      this._t = setTimeout(function () { self.notice = ""; }, 4000);
    },
    tab: function () { this.notice = ""; this.navOpen = false; }
  },
  created: function () {
    var self = this;
    try { var u = sessionStorage.getItem("sittaUser"); if (u) this.user = JSON.parse(u); } catch (e) {}
    Promise.all([api.fetchData(), api.loadTemplates(TEMPLATES)]).then(function (r) {
      self.state = r[0];
      self.ready = true;
    }).catch(function (err) {
      alert("Gagal memuat aplikasi: " + err.message + "\nJalankan lewat web server lokal.");
    });
  },
  methods: {
    onLogin: function (u) {
      this.user = u;
      try { sessionStorage.setItem("sittaUser", JSON.stringify(u)); } catch (e) {}
      this.notice = "Selamat datang, " + u.nama + ".";
    },
    logout: function () {
      this.user = null;
      try { sessionStorage.removeItem("sittaUser"); } catch (e) {}
      this.tab = "home";
    },
    pindah: function (t) { this.tab = t; window.scrollTo(0, 0); },
    tambahStok: function (item) {
      this.state.stok.push(item);
      this.notice = "Data " + item.kode + " berhasil ditambahkan.";
    },
    ubahStok: function (u) {
      var t = this.state.stok.find(function (s) { return s.kode === u.kode && s.upbjj === u.upbjj; });
      if (t) {
        t.lokasiRak = u.lokasiRak; t.harga = u.harga; t.qty = u.qty; t.safety = u.safety; t.catatanHTML = u.catatanHTML;
        this.notice = "Data " + u.kode + " berhasil diperbarui.";
      }
    },
    hapusStok: function (item) {
      var self = this;
      this.$refs.modal.ask({
        title: "Hapus bahan ajar?",
        message: "Hapus " + item.kode + " – " + item.judul + " (" + item.upbjj + ")? Tindakan ini tidak dapat dibatalkan.",
        okText: "Hapus", danger: true
      }).then(function (ya) {
        if (!ya) return;
        var i = self.state.stok.indexOf(item);
        if (i > -1) self.state.stok.splice(i, 1);
        self.notice = "Data " + item.kode + " dihapus.";
      });
    },
    handleNewDO: function (p) {
      this.$set(this.state.tracking, p.nomor, p.data);
      this.notice = "DO " + p.nomor + " berhasil dibuat.";
      this.tab = "tracking";
    },
    tambahProgress: function (p) {
      var d = this.state.tracking[p.nomor];
      if (!d) return;
      d.perjalanan.push({ waktu: p.waktu, keterangan: p.keterangan });
      this.notice = "Progress DO " + p.nomor + " ditambahkan.";
    }
  }
});
