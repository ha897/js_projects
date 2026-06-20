"use client";

const toast = (message, type) => {
  const toastDiv = document.createElement("div");
  toastDiv.textContent = message;
  toastDiv.style.position = "fixed";
  toastDiv.style.textAlign = "center";
  toastDiv.style.width = "250px";
  toastDiv.style.top = "20px";
  toastDiv.style.right = "20px";
  toastDiv.style.padding = "10px 15px";
  toastDiv.style.borderRadius = "6px";
  toastDiv.style.color = "#fff";
  toastDiv.style.fontSize = "14px";
  toastDiv.style.zIndex = 9999;
  toastDiv.style.opacity = "1";
  toastDiv.style.transition = "opacity 0.5s ease";

  const colors = {
    success: "#16a34a",
    error: "#dc2626",
    warning: "#d97706",
    info: "#2563eb",
  };
  toastDiv.style.backgroundColor = colors[type] || "#333";

  document.body.appendChild(toastDiv);

  setTimeout(() => {
    toastDiv.style.opacity = "0";
  }, 3000);


  setTimeout(() => {
    toastDiv.remove();
  }, 3500);
};

export default toast;
// to use
      // <input type="button" onClick={()=>toast("toast status is success", "success")}/>
