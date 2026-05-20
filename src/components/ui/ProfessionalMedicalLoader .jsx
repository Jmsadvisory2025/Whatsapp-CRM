import React from "react";

const styles = `
  * {
    box-sizing: border-box;
  }

  @keyframes float-gentle {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-8px); }
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  @keyframes pulse-dot {
    0%, 80%, 100% {
      opacity: 0.3;
      transform: scale(0.8);
    }
    40% {
      opacity: 1;
      transform: scale(1.2);
    }
  }

  @keyframes dash-move {
    0% { stroke-dashoffset: 120; }
    100% { stroke-dashoffset: 0; }
  }

  @keyframes pop-in {
    0% {
      transform: scale(0.7);
      opacity: 0;
    }
    60% {
      transform: scale(1.1);
    }
    100% {
      transform: scale(1);
      opacity: 1;
    }
  }

  @keyframes tick-appear {
    0%, 60% {
      opacity: 0;
      transform: scale(0.5);
    }
    100% {
      opacity: 1;
      transform: scale(1);
    }
  }

  @keyframes text-blink {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.4;
    }
  }

  @keyframes orbit {
    from {
      transform: rotate(0deg) translateX(120px) rotate(0deg);
    }
    to {
      transform: rotate(360deg) translateX(120px) rotate(-360deg);
    }
  }

  @keyframes center-pulse {
    0%, 100% {
      transform: scale(1);
      box-shadow: 0 0 0 0 rgba(37,211,102,0.35);
    }
    50% {
      transform: scale(1.08);
      box-shadow: 0 0 0 14px rgba(37,211,102,0);
    }
  }

  @keyframes progress-move {
    0% {
      width: 0%;
    }
    50% {
      width: 75%;
    }
    100% {
      width: 100%;
    }
  }
`;

const WhatsAppCRMLoader = ({
  text = "Loading ...",
}) => {
  return (
    <>
      <style>{styles}</style>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          padding: "2rem",
          background:
            "linear-gradient(135deg, #EFF3FB 0%, #F7FAFF 50%, #EEF4FF 100%)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "relative",
            width: 360,
            height: 360,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* Background Dots */}
          <svg
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              opacity: 0.08,
            }}
            viewBox="0 0 360 360"
          >
            {[40, 70, 100, 130, 160, 190, 220, 250, 280, 310].flatMap((cx) =>
              [40, 70, 100, 130].map((cy) => (
                <circle
                  key={`${cx}-${cy}`}
                  cx={cx}
                  cy={cy}
                  r="2.5"
                  fill="#1A73E8"
                />
              ))
            )}
          </svg>

          {/* Main CRM Loader */}
          <div
            style={{
              position: "relative",
              width: 150,
              height: 150,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {/* Outer Ring */}
            <div
              style={{
                position: "absolute",
                width: 150,
                height: 150,
                borderRadius: "50%",
                border: "2px dashed rgba(26,115,232,0.25)",
                animation: "spin 12s linear infinite",
              }}
            />

            {/* Center WhatsApp Circle */}
            <div
              style={{
                width: 84,
                height: 84,
                borderRadius: "50%",
                background: "linear-gradient(135deg,#25D366,#18b857)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                animation: "center-pulse 2s ease-in-out infinite",
                boxShadow: "0 10px 30px rgba(37,211,102,0.35)",
                zIndex: 5,
              }}
            >
              <svg width="42" height="42" viewBox="0 0 24 24" fill="white">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.116.549 4.099 1.514 5.82L.054 23.166a.5.5 0 00.61.637l5.543-1.446A11.936 11.936 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22a9.932 9.932 0 01-5.07-1.384l-.36-.214-3.734.974.999-3.639-.234-.374A9.96 9.96 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
              </svg>
            </div>

            {/* Orbit Icons */}
            {[
              {
                icon: "📢",
                bg: "#E8F0FE",
                delay: "0s",
              },
              {
                icon: "💬",
                bg: "#E9FFF1",
                delay: "-4s",
              },
              {
                icon: "👥",
                bg: "#EEF3FF",
                delay: "-8s",
              },
            ].map((item, i) => (
              <div
                key={i}
                style={{
                  position: "absolute",
                  width: 46,
                  height: 46,
                  borderRadius: "50%",
                  background: item.bg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 20,
                  boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
                  animation: `orbit 12s linear infinite`,
                  animationDelay: item.delay,
                }}
              >
                {item.icon}
              </div>
            ))}
          </div>

          {/* Left Floating Menu */}
          <div
            style={{
              position: "absolute",
              left: 0,
              top: "50%",
              transform: "translateY(-50%)",
              display: "flex",
              flexDirection: "column",
              gap: 14,
              animation: "float-gentle 5s ease-in-out infinite",
            }}
          >
            {[].map((label) => (
              <div
                key={label}
                style={{
                  background: "#fff",
                  padding: "10px 14px",
                  borderRadius: 14,
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#42526E",
                  boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
                }}
              >
                {label}
              </div>
            ))}
          </div>

          {/* Typing Bubble */}
          <div
            style={{
              position: "absolute",
              right: 0,
              top: 80,
              animation: "float-gentle 4s ease-in-out infinite",
            }}
          >
            <div
              style={{
                background: "#DCE8FF",
                borderRadius: "16px 16px 16px 4px",
                padding: "12px 16px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  gap: 5,
                  alignItems: "center",
                }}
              >
                {[0, 0.2, 0.4].map((delay, i) => (
                  <div
                    key={i}
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: "50%",
                      background: "#1A73E8",
                      animation: `pulse-dot 1.4s ease-in-out infinite ${delay}s`,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Success Bubble */}
          <div
            style={{
              position: "absolute",
              right: 20,
              bottom: 60,
              animation: "pop-in 1s ease-out infinite alternate",
            }}
          >
            <div
              style={{
                background: "#fff",
                padding: "12px 14px",
                borderRadius: 16,
                boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
                minWidth: 120,
              }}
            >
              <div
                style={{
                  height: 6,
                  background: "#E6EEFF",
                  borderRadius: 999,
                  marginBottom: 8,
                }}
              />
              <div
                style={{
                  height: 6,
                  width: "70%",
                  background: "#E6EEFF",
                  borderRadius: 999,
                  marginBottom: 10,
                }}
              />

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                }}
              >
                <div
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: "50%",
                    background: "#1A73E8",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    animation: "tick-appear 1.5s ease-out infinite",
                  }}
                >
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 10 10"
                    fill="none"
                  >
                    <path
                      d="M2 5l2.5 2.5L8 3"
                      stroke="white"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Loading Text + Progress */}
        <div
          style={{
            width: 280,
            marginTop: 10,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <div
            style={{
              marginBottom: 16,
              fontSize: 15,
              color: "#42526E",
              fontWeight: 600,
              animation: "text-blink 2s ease-in-out infinite",
            }}
          >
            {text}
          </div>

          {/* Progress Bar */}
          <div
            style={{
              width: "100%",
              height: 8,
              borderRadius: 999,
              background: "#DCE7FA",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                borderRadius: 999,
                background:
                  "linear-gradient(90deg,#1A73E8,#25D366)",
                animation: "progress-move 2.5s ease-in-out infinite",
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default WhatsAppCRMLoader;