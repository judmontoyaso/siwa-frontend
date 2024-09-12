"use client";

import React, { useEffect, useRef, useState } from "react";
import { useUser } from "@auth0/nextjs-auth0/client";
import { Menu } from "primereact/menu";
import { Toast } from "primereact/toast";
import { FaAngleDown, FaAngleUp } from "react-icons/fa";
import ProjectSelector from "./projectSelector";
import { Avatar } from "primereact/avatar";

interface NavbarProps {
  slug: string;
  breadcrumbs: string;
}

const Navbar: React.FC<NavbarProps> = ({ slug, breadcrumbs }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useUser();
  const menu = useRef(null);
  const toast = useRef(null);

  const [selectedProject, setSelectedProject] = useState(slug);
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    setProjects((user?.Project as any) ?? []);
  }, [user]);

  const onProjectChange = (e: { value: React.SetStateAction<string> }) => {
    setSelectedProject(e.value);
  };

  const onMenuShow = () => setIsOpen(true);
  const onMenuHide = () => setIsOpen(false);

  return (
    <nav className="flex justify-between items-center p-4 bg-white shadow-md">
      {/* Breadcrumbs con borde, sin fondo */}
        <div className="border flex-1 border-gray-300 rounded-md py-1 px-4 text-sm text-gray-600">
          {breadcrumbs}
        </div>

      <div className="flex items-center space-x-4">
        {/* Selector de Proyectos */}
        <div className="flex items-center">
          <ProjectSelector slug={slug} user={user} />
        </div>

        {/* Avatar y Menú de Usuario */}
        <div className="relative">
          <button
            onClick={(e) => (menu.current as any)?.toggle(e)}
            aria-controls="popup_menu_left"
            aria-haspopup
            className="flex items-center space-x-2 focus:outline-none"
          >
            <Avatar
              image={user?.picture ?? ""}
              icon="pi pi-user"
              size="large"
              shape="circle"
              className="border-none shadow-sm"
            />
            <div className="flex items-center">
              {isOpen ? (
                <FaAngleUp className="ml-1 w-5 h-5 text-gray-500" />
              ) : (
                <FaAngleDown className="ml-1 w-5 h-5 text-gray-500" />
              )}
            </div>
          </button>

          <Toast ref={toast} />
          <Menu
            model={[
              { label: "Profile", icon: "pi pi-fw pi-user", url: "/profile" },
              {
                label: "Sign Out",
                icon: "pi pi-fw pi-sign-out",
                url: "/api/auth/logout",
              },
            ]}
            popup
            ref={menu}
            id="popup_menu"
            onShow={onMenuShow}
            onHide={onMenuHide}
            className="mt-2"
          />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
