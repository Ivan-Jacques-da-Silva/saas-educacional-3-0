
import React from "react";
import MasterLayout from "../masterLayout/MasterLayout";
import Breadcrumb from "../components/Breadcrumb";
import CursosLayout from "../components/CursosLayout";

const Cursos = () => {
  return (
    <MasterLayout>
      <div className="main-content">
        <div className="page-content">
          <div className="container-fluid">
            <Breadcrumb title="Cursos" pageTitle="Gestão de Cursos" />
            <CursosLayout />
          </div>
        </div>
      </div>
    </MasterLayout>
  );
};

export default Cursos;
