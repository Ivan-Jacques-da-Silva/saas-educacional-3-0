import React from "react";
import { useParams } from "react-router-dom";
import MasterLayout from "../masterLayout/MasterLayout.jsx";
import Breadcrumb from "../components/Breadcrumb.jsx";
import CadastroCurso from "../components/CadastroCurso.jsx";

const PaginaCadastroCurso = () => {
  const { id } = useParams();

  return (
    <>
      {/* MasterLayout */}
      <MasterLayout>
        {/* Breadcrumb */}
        <Breadcrumb title={id ? "Editar Curso" : "Cadastro de Curso"} />

        {/* CadastroCurso */}
        <CadastroCurso cursoId={id} />
      </MasterLayout>
    </>
  );
};

export default PaginaCadastroCurso;