import * as React from "react";
import { motion } from "framer-motion";

const variants = {
  open: {
    y: 0,
    opacity: 1,
    transition: {
      y: { stiffness: 1000, velocity: -100 }
    }
  },
  closed: {
    y: 50,
    opacity: 0,
    transition: {
      y: { stiffness: 1000 }
    }
  }
};

const colors = ["#FF008C", "#D309E1", "#9C1AFF", "#7700FF", "#4400FF"];

// 🔁 Relaciona el texto con el id del section correspondiente
const hrefMap = {
  Planes: "#planes",
  Retos: "#retos",
  Exitos: "#exitos",
  Faq: "#faq",
  Contacto: "#contacto"
};

export const MenuItem = ({ text, index }) => {
  const style = {};
  const href = hrefMap[text] || "#";

  return (
    <motion.li
      variants={variants}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      className="style-li"
    >
      <a href={href} style={{ textDecoration: "none", color: "white", display: "block" }}>
        <div style={style}>{text}</div>
      </a>
    </motion.li>
  );
};
