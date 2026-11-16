
Vue.component("app-modal", {
  template: "#tpl-modal",
  data: function () {
    return { show: false, title: "", message: "", okText: "Ya", cancelText: "Batal", danger: false, resolver: null };
  },
  methods: {
    ask: function (opt) {
      var self = this;
      this.title = opt.title || "Konfirmasi";
      this.message = opt.message || "";
      this.okText = opt.okText || "Ya";
      this.cancelText = opt.cancelText || "Batal";
      this.danger = !!opt.danger;
      this.show = true;
      return new Promise(function (resolve) { self.resolver = resolve; });
    },
    close: function (jawaban) {
      this.show = false;
      if (this.resolver) this.resolver(jawaban);
      this.resolver = null;
    }
  }
});
