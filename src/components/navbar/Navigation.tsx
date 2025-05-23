import * as React from "react";
import { motion } from "framer-motion";
import { MenuItem } from "./MenuItem";
import ComenzarButton from "./Comenzar-button";

const variants = {
  open: {
    transition: { staggerChildren: 0.07, delayChildren: 0.2 }
  },
  closed: {
    transition: { staggerChildren: 0.05, staggerDirection: -1 }
  }
};

export const Navigation = () => (
    <motion.ul className="styles-ul" variants={variants}>
      {menuItems.map((item, index) => (
        <MenuItem text={item} key={index} index={index} />
      ))}
      <ComenzarButton />
    </motion.ul>
  );

const menuItems = ["Planes", "Retos", "Exitos", "Faq", "Contacto"];
