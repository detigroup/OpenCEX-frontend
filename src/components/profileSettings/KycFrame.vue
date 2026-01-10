<template>
  <div id="idensic"></div>
</template>

<script>
export default {
  name: "KycFrame",
  props: {
    isWizard: {
      type: Boolean,
    },
  },
  data() {
    return {
      kyctoken: "",
      kycuser: "",
    };
  },
  methods: {
    renderKYC(aToken, user) {
      // Workaround for Sumsub WebSDK bug: it sends POST to /status/pending
      // with Content-Type: application/x-www-form-urlencoded and a body,
      // causing 400 "Unexpected body". Patch fetch to strip body and Content-Type/Content-Length
      // ONLY for requests to "/status/pending" with method POST.
      (function installSumsubPendingFetchPatch() {
        try {
          if (typeof window === "undefined") return;
          if (window.__SUMSUB_PENDING_PATCHED__) return;
          window.__SUMSUB_PENDING_PATCHED__ = true;

          const originalFetch = window.fetch;
          if (typeof originalFetch !== "function") return;

          function normalizeAndRemoveHeaders(h) {
            if (!h) return undefined;
            if (h instanceof Headers) {
              const h2 = new Headers(h);
              h2.delete("content-type");
              h2.delete("Content-Type");
              h2.delete("content-length");
              h2.delete("Content-Length");
              return h2;
            } else if (Array.isArray(h)) {
              return h.filter(function (pair) {
                var k = String(pair && pair[0]).toLowerCase();
                return k !== "content-type" && k !== "content-length";
              });
            } else if (typeof h === "object") {
              var obj = Object.assign({}, h);
              Object.keys(obj).forEach(function (k) {
                var lk = k.toLowerCase();
                if (lk === "content-type" || lk === "content-length") {
                  delete obj[k];
                }
              });
              return obj;
            }
            return h;
          }

          window.fetch = function patchedFetch(input, init) {
            try {
              var isRequestObj = (typeof Request !== "undefined") && (input instanceof Request);
              var url = "";
              var method = "GET";

              if (isRequestObj) {
                url = input && input.url ? input.url : "";
                method = (init && init.method) || (input && input.method) || "GET";
              } else {
                url = typeof input === "string" ? input : (input && input.toString ? input.toString() : "");
                method = (init && init.method) || "GET";
              }

              var shouldPatch = url.indexOf("/status/pending") !== -1 && String(method).toUpperCase() === "POST";
              if (!shouldPatch) {
                return originalFetch(input, init);
              }

              var newInit = init ? Object.assign({}, init) : {};
              var headersToModify = (newInit.headers !== undefined) ? newInit.headers : (isRequestObj ? input.headers : undefined);
              newInit.headers = normalizeAndRemoveHeaders(headersToModify);

              if (Object.prototype.hasOwnProperty.call(newInit, "body")) {
                delete newInit.body;
              }
              newInit.method = method;

              if (isRequestObj) {
                var props = [
                  "credentials","mode","cache","redirect","referrer",
                  "referrerPolicy","integrity","keepalive","signal"
                ];
                props.forEach(function (p) {
                  var val = input && input[p];
                  if (val !== undefined && newInit[p] === undefined) {
                    newInit[p] = val;
                  }
                });
                return originalFetch(input.url, newInit);
              }

              return originalFetch(input, newInit);
            } catch (e) {
              return originalFetch(input, init);
            }
          };
        } catch (e) {
          // swallow to avoid breaking app; fall back to original behavior
        }
      })();

      if (!document.querySelector("#idensic")) return;

      /* eslint-disable */
      const id = idensic.init(
          "#idensic",
          {
            clientId: "OpenCEX",
            externalUserId: user,
            accessToken: aToken,
            navConf: {
              skipWelcomeScreen: false,
              skipAgreementsScreen: false,
              skipReviewScreen: false,
              registration: "disabled"
            },
            uiConf: {
              customCss: "",
              lang: localStorage.getItem("planguage") || "en",
              steps: {
                IDENTITY: {
                  subTitle: ""
                },
                IDENTITY2: {
                  subTitle: ""
                },
                SELFIE: {
                  subTitle: ""
                },
                SELFIE2: {
                  subTitle: "",
                  videoRequired: "enabled"
                },
                PROOF_OF_RESIDENCE: {
                  subTitle: ""
                },
                INVESTABILITY: {
                  subTitle: ""
                },
                ACCREDITED_INVESTOR: {
                  subTitle: ""
                },
                COMPANY: {
                  subTitle: ""
                },
                E_SIGN: {
                  subTitle: ""
                }
              }
            }
          },
          function(messageType, payload) {
          }
      );
    }
  },
  mounted() {
    this.$http
        .post(
            "kyc_get_access_token/?source=wizard"
        )
        .then(
            response => {
              this.kyctoken = response.data["token"];
              this.kycuser = response.data["userId"];
              this.renderKYC(response.data["token"], response.data["userId"]);
            }
        );
  }
};
</script>
