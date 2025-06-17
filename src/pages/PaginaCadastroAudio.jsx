import React from "react";
import { useParams } from "react-router-dom";
import MasterLayout from "../masterLayout/MasterLayout.jsx";
import Breadcrumb from "../components/Breadcrumb.jsx";
import CadastroAudio from "../components/CadastroAudio.jsx";

const PaginaCadastroAudio = () => {
  const { id } = useParams();

  return (
    <>
      {/* MasterLayout */}
      <MasterLayout>
        {/* Breadcrumb */}
        <Breadcrumb title={id ? "Editar Áudio" : "Cadastro de Áudio"} />

        {/* CadastroAudio */}
        <CadastroAudio audioId={id} />
      </MasterLayout>
    </>
  );
};

export default PaginaCadastroAudio;