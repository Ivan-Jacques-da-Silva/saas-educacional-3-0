import React from "react";
import { useParams } from "react-router-dom";
import MasterLayout from "../masterLayout/MasterLayout.jsx";
import Breadcrumb from "../components/Breadcrumb.jsx";
import CadastroUsuario from "../components/CadastroUsuario.jsx";

const PaginaCadastroUsuario = () => {
  const { id } = useParams();

  return (
    <>
      {/* MasterLayout */}
      <MasterLayout>
        {/* Breadcrumb */}
        <Breadcrumb title={id ? "Editar Usuário" : "Cadastro de Usuário"} />

        {/* CadastroUsuario */}
        <CadastroUsuario usuarioId={id} />
      </MasterLayout>
    </>
  );
};

export default PaginaCadastroUsuario;