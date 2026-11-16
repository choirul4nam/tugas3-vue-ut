
Vue.component("login-form", {
  template: "#tpl-login",
  data: function () {
    return { form: { username: "", password: "" }, errors: {}, pesan: "", lihat: false };
  },
  watch: {
    
    "form.username": function () { this.pesan = ""; },
    "form.password": function () { this.pesan = ""; }
  },
  methods: {
    submit: function () {
      var e = {};
      if (!this.form.username.trim()) e.username = "Username wajib diisi.";
      if (!this.form.password) e.password = "Password wajib diisi.";
      this.errors = e;
      if (Object.keys(e).length) return;
      var u = api.login(this.form.username.trim(), this.form.password);
      if (!u) { this.pesan = "Username atau password salah."; return; }
      this.$emit("login", u);
    }
  }
});
