
Vue.component("ba-stock-table", {
  template: "#tpl-stock",
  props: {
    items: { type: Array, required: true },
    upbjjList: { type: Array, default: function () { return []; } },
    kategoriList: { type: Array, default: function () { return []; } }
  },
  data: function () {
    return {
      filter: { upbjj: "", kategori: "", reorderOnly: false },
      sort: { by: "judul", dir: "asc" },
      form: this.kosongForm(),
      errors: {},
      editing: null,
      editErrors: {},
      hoverKey: null,   
      pesan: ""
    };
  },
  computed: {
    
    kategoriOptions: function () {
      var self = this;
      return this.kategoriList.filter(function (k) {
        return self.items.some(function (s) { return s.upbjj === self.filter.upbjj && s.kategori === k; });
      });
    },
    
    filteredStok: function () {
      var f = this.filter;
      var hasil = this.items.filter(function (s) {
        if (f.upbjj && s.upbjj !== f.upbjj) return false;
        if (f.kategori && s.kategori !== f.kategori) return false;
        if (f.reorderOnly && !(s.qty < s.safety || s.qty === 0)) return false;
        return true;
      });
      var by = this.sort.by, arah = this.sort.dir === "asc" ? 1 : -1;
      return hasil.slice().sort(function (a, b) {
        if (by === "judul") return a.judul.localeCompare(b.judul) * arah;
        return (a[by] - b[by]) * arah;
      });
    },
    ringkasan: function () {
      var r = { aman: 0, menipis: 0, kosong: 0 };
      this.filteredStok.forEach(function (s) {
        if (s.qty === 0) r.kosong++; else if (s.qty < s.safety) r.menipis++; else r.aman++;
      });
      return r;
    },
    formStatusPreview: function () {
      var q = this.form.qty, s = this.form.safety;
      if (typeof q !== "number" || typeof s !== "number") return "";
      if (q === 0) return "⛔ Kosong";
      return q < s ? "⚠️ Menipis" : "✅ Aman";
    }
  },
  watch: {
    
    "filter.upbjj": function () { this.filter.kategori = ""; },
    
    "filter.reorderOnly": function (on) {
      this.pesan = on ? "Menampilkan bahan ajar yang perlu di-reorder (" + this.filteredStok.length + " item)." : "";
    },
    
    "form.kode": function (v) {
      var b = String(v).toUpperCase().replace(/\s/g, "");
      if (b !== v) this.form.kode = b;
    }
  },
  methods: {
    kosongForm: function () {
      return { kode: "", judul: "", kategori: "", upbjj: "", lokasiRak: "", harga: null, qty: null, safety: null, catatan: "" };
    },
    keyOf: function (s) { return s.kode + "|" + s.upbjj; },
    resetFilter: function () {
      this.filter = { upbjj: "", kategori: "", reorderOnly: false };
      this.sort = { by: "judul", dir: "asc" };
      this.pesan = "";
    },
    validate: function (d, baru) {
      var e = {};
      if (baru) {
        if (!d.kode) e.kode = "Kode wajib diisi.";
        else if (!/^[A-Z]{3,6}\d{4}$/.test(d.kode)) e.kode = "Format kode: huruf + 4 angka (mis. EKMA4117).";
        else if (this.items.some(function (s) { return s.kode === d.kode && s.upbjj === d.upbjj; })) e.kode = "Kode sudah ada untuk UT-Daerah ini.";
        if (!d.judul || d.judul.length < 3) e.judul = "Judul minimal 3 karakter.";
        if (!d.kategori) e.kategori = "Pilih kategori.";
        if (!d.upbjj) e.upbjj = "Pilih UT-Daerah.";
      }
      if (!/^R\d+-[A-Z]\d+$/.test(d.lokasiRak || "")) e.lokasiRak = "Format rak: R1-A3.";
      if (typeof d.harga !== "number" || !(d.harga > 0)) e.harga = "Harga harus lebih dari 0.";
      if (typeof d.qty !== "number" || !Number.isInteger(d.qty) || d.qty < 0) e.qty = "Stok harus bilangan bulat >= 0.";
      if (typeof d.safety !== "number" || !Number.isInteger(d.safety) || d.safety < 0) e.safety = "Safety harus bilangan bulat >= 0.";
      return e;
    },
    
    tambah: function () {
      this.errors = this.validate(this.form, true);
      if (Object.keys(this.errors).length) return;
      var f = this.form;
      this.$emit("add", {
        kode: f.kode, judul: f.judul, kategori: f.kategori, upbjj: f.upbjj, lokasiRak: f.lokasiRak,
        harga: f.harga, qty: f.qty, safety: f.safety, catatanHTML: api.escapeHtml(f.catatan || "")
      });
      this.resetForm();
    },
    resetForm: function () { this.form = this.kosongForm(); this.errors = {}; },
    
    mulaiEdit: function (item) {
      this.editing = {
        kode: item.kode, upbjj: item.upbjj, judul: item.judul, lokasiRak: item.lokasiRak,
        harga: item.harga, qty: item.qty, safety: item.safety,
        catatan: item.catatanHTML.replace(/<[^>]*>/g, "")
      };
      this.editErrors = {};
    },
    simpanEdit: function () {
      this.editErrors = this.validate(this.editing, false);
      if (Object.keys(this.editErrors).length) return;
      var e = this.editing;
      this.$emit("update", {
        kode: e.kode, upbjj: e.upbjj, lokasiRak: e.lokasiRak, harga: e.harga, qty: e.qty, safety: e.safety,
        catatanHTML: api.escapeHtml(e.catatan || "")
      });
      this.editing = null;
    },
    batalEdit: function () { this.editing = null; this.editErrors = {}; },
    
    hapus: function (item) { this.$emit("delete", item); }
  }
});
