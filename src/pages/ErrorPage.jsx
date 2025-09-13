import React from "react";
import AllIcons from "../assets/images/assets";
const { ErrorGif } = AllIcons;
const ErrorPage = ({ status = "404" }) => {
  const getErrorConfig = (status) => {
    const configs = {
      404: {
        title: "Look like you're lost",
        message:
          "the page you are looking for not avaible! Go back to Dahsboard.",
        displayTitle: "404",
      },
      400: {
        title: "Bad Request",
        message:
          "The request was invalid. Please check your input and try again.",
        displayTitle: "400",
      },
      401: {
        title: "Unauthorized",
        message: "You are not authorized to access this page. Please log in.",
        displayTitle: "401",
      },
      500: {
        title: "Server Error",
        message: "Our servers are having issues. Please try again later.",
        displayTitle: "500",
      },
    };

    return (
      configs[status] || {
        title: "Something went wrong",
        message: `An error occurred (${status}). Please try again later.`,
        displayTitle: status,
      }
    );
  };

  const config = getErrorConfig(status);

  const handleGoHome = (e) => {
    e.preventDefault();
    window.location.href = "/";
  };

  return (
    <section
      style={{
        padding: "40px 0",
        background: "#fff",
        fontFamily: "'Arvo', serif",
        minHeight: "100vh",
      }}
    >
      <div
        style={{
          maxWidth: "1170px",
          margin: "0 auto",
          padding: "0 15px",
        }}
      >
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            marginLeft: "-15px",
            marginRight: "-15px",
          }}
        >
          <div
            style={{
              width: "100%",
              padding: "0 15px",
            }}
          >
            <div
              style={{
                width: "83.33333333%",
                marginLeft: "8.33333333%",
                textAlign: "center",
                padding: "0 15px",
              }}
            >                <h1
                  style={{
                    fontSize: "80px",
                    textAlign: "center",
                    margin: 0,
                    color: "#333",
                    fontWeight: "bold",
                  }}
                >
                  {config.displayTitle}
                </h1>
              {/* Four Zero Four Background */}
              <div
                style={{
                  backgroundImage: `url(${ErrorGif})`,
                  height: "400px",
                  backgroundPosition: "center",
                  backgroundRepeat: "no-repeat",
                  backgroundSize: "cover",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              ></div>

              {/* Content Box */}
              <div style={{ marginTop: "-50px" }}>

                <h3
                  style={{
                    fontSize: "80px",
                    margin: 0,
                    fontWeight: "bold",
                    color: "#333",
                  }}
                >
                  {config.title}
                </h3>

                <p
                  style={{
                    fontSize: "16px",
                    color: "#666",
                    margin: "20px 0",
                  }}
                >
                  {config.message}
                </p>

                <a
                  href="/"
                  onClick={handleGoHome}
                  style={{
                    color: "#fff",
                    padding: "10px 20px",
                    background: "#39ac31",
                    margin: "20px 0",
                    display: "inline-block",
                    textDecoration: "none",
                    borderRadius: "4px",
                    fontWeight: "500",
                    transition: "background-color 0.3s ease",
                  }}
                  onMouseEnter={(e) => (e.target.style.background = "#2d8a26")}
                  onMouseLeave={(e) => (e.target.style.background = "#39ac31")}
                >
                  Go to Home
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ErrorPage;
