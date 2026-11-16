
Vue.component("order-form", {
  template: "#tpl-order",
  props: {
    paket: { type: Array, required: true },
    ekspedisi: { type: Array, required: true },
    stok: { type: Array, default: function () { return []; } },
    nextNumber: { type: String, required: true }
  },
  data: function () {
    return { form: this.kosongForm(), errors: {} };
  },
  computed: {
    paketTerpilih: function () {
      var k = this.form.paket;
      return this.paket.find(function (p) { return p.kode === k; }) || null;
    },
    isiPaketDetail: function () {
      if (!this.paketTerpilih) return [];
      var self = this;
      return this.paketTerpilih.isi.map(function (kode) {
        return self.stok.find(function (s) { return s.kode === kode; }) || { kode: kode, judul: "(tidak ditemukan)", harga: 0 };
      });
    },
    totalHarga: function () { return this.paketTerpilih ? this.paketTerpilih.harga : 0; }
  },
  watch: {
    "form.nim": function (v) {
      var a = String(v).replace(/\D/g, "");
      if (a !== v) this.form.nim = a;
    },
    "form.paket": function () { this.$delete(this.errors, "paket"); }
  },
  methods: {
    kosongForm: function () {
      return { nim: "", nama: "", ekspedisi: "", paket: "", tanggalKirim: api.hariIni() };
    },
    validate: function () {
      var e = {}, f = this.form;
      if (!/^\d{9,12}$/.test(f.nim)) e.nim = "NIM harus 9-12 digit angka.";
      if (!f.nama || f.nama.length < 3) e.nama = "Nama minimal 3 karakter.";
      if (!f.ekspedisi) e.ekspedisi = "Pilih ekspedisi.";
      if (!f.paket) e.paket = "Pilih paket bahan ajar.";
      if (!f.tanggalKirim) e.tanggalKirim = "Tanggal kirim wajib diisi.";
      return e;
    },
    
    simpan: function () {
      this.errors = this.validate();
      if (Object.keys(this.errors).length) return;
      var f = this.form;
      this.$emit("created", {
        nomor: this.nextNumber,
        data: {
          nim: f.nim, nama: f.nama, status: "Diproses", ekspedisi: f.ekspedisi,
          tanggalKirim: f.tanggalKirim, paket: f.paket, total: this.totalHarga,
          perjalanan: [{ waktu: api.waktuSekarang(), keterangan: "DO dibuat, menunggu pengiriman" }]
        }
      });
      this.resetForm();
    },
    resetForm: function () { this.form = this.kosongForm(); this.errors = {}; }
  }
});
