
Vue.component("do-tracking", {
  template: "#tpl-tracking",
  props: {
    data: { type: Object, required: true },   
    paket: { type: Array, default: function () { return []; } },
    stok: { type: Array, default: function () { return []; } }
  },
  data: function () {
    return {
      cari: { keyword: "", hasil: [], pesan: "" },
      terpilih: null,                   
      progress: { keterangan: "", error: "" }
    };
  },
  computed: {
    
    daftarDO: function () {
      var self = this;
      return Object.keys(this.data).sort().map(function (k) {
        return Object.assign({ nomor: k }, self.data[k]);
      });
    },
    
    detail: function () {
      return this.terpilih && this.data[this.terpilih]
        ? Object.assign({ nomor: this.terpilih }, this.data[this.terpilih]) : null;
    },
    
    infoDetail: function () {
      var d = this.detail;
      if (!d) return {};
      return {
        "Nomor DO": d.nomor,
        "NIM / Nama": d.nim + " – " + d.nama,
        "Ekspedisi": d.ekspedisi,
        "Paket": d.paket + " – " + this.namaPaket(d.paket)
      };
    }
  },
  watch: {
    
    "cari.keyword": function (v) {
      if (!v) this.resetCari(); else this.cari.pesan = "";
    },
    terpilih: function () { this.progress = { keterangan: "", error: "" }; }
  },
  methods: {
    namaPaket: function (kode) {
      var p = this.paket.find(function (x) { return x.kode === kode; });
      return p ? p.nama : "-";
    },
    
    cariDO: function () {
      var k = this.cari.keyword.trim().toUpperCase();
      if (!k) { this.cari.pesan = "Masukkan Nomor DO atau NIM."; this.cari.hasil = []; return; }
      this.cari.hasil = this.daftarDO.filter(function (d) { return d.nomor === k || d.nim === k; });
      if (!this.cari.hasil.length) { this.cari.pesan = "Tidak ditemukan DO/NIM \"" + k + "\"."; this.terpilih = null; return; }
      this.cari.pesan = "";
      this.terpilih = this.cari.hasil[0].nomor;
    },
    
    resetCari: function () {
      this.cari = { keyword: "", hasil: [], pesan: "" };
      this.terpilih = null;
    },
    lihat: function (nomor) { this.terpilih = nomor; },
    
    tambahProgress: function () {
      var ket = this.progress.keterangan.trim();
      if (ket.length < 3) { this.progress.error = "Keterangan minimal 3 karakter."; return; }
      this.$emit("progress", { nomor: this.terpilih, waktu: api.waktuSekarang(), keterangan: ket });
      this.progress = { keterangan: "", error: "" };
    }
  }
});
