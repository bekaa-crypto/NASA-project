import React, { useState, useRef, useEffect } from "react";

const styles = {
  container: {
    position: "relative",
    display: "inline-block",
    minWidth: "220px",
  },
  control: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    background: "#fff",
    color: "#000",
    padding: "8px 10px",
    borderRadius: "4px",
    border: "1px solid rgba(0,0,0,0.2)",
    cursor: "pointer",
  },
  list: {
    position: "absolute",
    top: "calc(100% + 6px)",
    left: 0,
    right: 0,
    background: "#fff",
    color: "#000",
    border: "1px solid rgba(0,0,0,0.12)",
    borderRadius: "4px",
    maxHeight: "220px",
    overflow: "auto",
    zIndex: 50,
  },
  option: {
    padding: "8px 10px",
    cursor: "pointer",
  },
  hiddenInput: {
    display: "none",
  },
};

function CustomSelect({
  id,
  name,
  options = [],
  value,
  onChange,
  placeholder = "Select...",
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function onDocClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  const handleSelect = (val) => {
    setOpen(false);
    if (onChange) onChange(val);
  };

  return (
    <div style={styles.container} ref={ref}>
      <div
        role="button"
        tabIndex={0}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((s) => !s)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") setOpen((s) => !s);
        }}
        style={styles.control}
      >
        <span>{value != null ? value : placeholder}</span>
        <span style={{ marginLeft: 8 }}>▾</span>
      </div>

      {open && (
        <div role="listbox" style={styles.list}>
          {options.length === 0 && <div style={styles.option}>No options</div>}
          {options.map((opt, idx) => (
            <div
              role="option"
              aria-selected={value === opt}
              key={typeof opt === "object" && opt !== null && opt.id !== undefined ? opt.id : `${opt}-${idx}`}
              onClick={() => handleSelect(opt)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSelect(opt);
              }}
              tabIndex={0}
              style={styles.option}
            >
              {typeof opt === "object" && opt !== null && opt.label !== undefined ? opt.label : opt}
            </div>
          ))}
        </div>
      )}

      {/* Hidden input so the component works inside native <form> submissions */}
      {name && (
        <input
          type="hidden"
          id={id}
          name={name}
          value={value || ""}
          style={styles.hiddenInput}
        />
      )}
    </div>
  );
}

export default CustomSelect;
