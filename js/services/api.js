
var api = {
  
  users: [
    { username: "admin", password: "admin123", nama: "Administrator SITTA", role: "Administrator" },
    { username: "mahasiswa", password: "ut2025", nama: "Mahasiswa UT", role: "UPBJJ-UT" }
  ],

  login: function (username, password) {
    var u = this.users.find(function (x) { return x.username === username && x.password === password; });
    return u ? { username: u.username, nama: u.nama, role: u.role } : null;
  },

  getJSON: function (url) {
    return fetch(url).then(function (r) {
      if (!r.ok) throw new Error("Gagal memuat " + url);
      return r.json();
    });
  },

  
  fetchData: function () {
    return this.getJSON("data/dataBahanAjar.json").then(function (d) {
      var tr = {};
      (d.tracking || []).forEach(function (o) { Object.assign(tr, o); });
      d.tracking = tr;
      return d;
    });
  },

  
  loadTemplates: function (names) {
    return Promise.all(names.map(function (n) {
      return fetch("templates/" + n + ".html").then(function (r) {
        if (!r.ok) throw new Error("Template " + n + " tidak ditemukan");
        return r.text();
      });
    })).then(function (list) {
      document.getElementById("template-root").innerHTML = list.join("\n");
    });
  },

  escapeHtml: function (t) {
    return String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  },

  hariIni: function () {
    var d = new Date();
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  },

  waktuSekarang: function () {
    return this.hariIni() + " " + new Date().toTimeString().slice(0, 8);
  }
};

/* ===== FILTER (formatting teks) – global ===== */
Vue.filter("rupiah", function (n) {
  return "Rp " + Number(n || 0).toLocaleString("id-ID");
});
Vue.filter("buah", function (n) {
  return Number(n || 0) + " buah";
});

Vue.filter("tanggalID", function (s) {
  var bulan = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];
  var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s || "");
  return m ? parseInt(m[3], 10) + " " + bulan[parseInt(m[2], 10) - 1] + " " + m[1] : (s || "-");
});
