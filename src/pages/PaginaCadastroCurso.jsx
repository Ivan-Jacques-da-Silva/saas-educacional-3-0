
import React from "react";
import MasterLayout from "../masterLayout/MasterLayout";
import Breadcrumb from "../components/Breadcrumb";
import CadastroCursoModal from "../components/CadastroCurso";

const PaginaCadastroCurso = () => {
  const [showModal, setShowModal] = React.useState(true);

  const handleClose = () => {
    setShowModal(false);
    window.history.back();
  };

  const handleCursoSaved = () => {
    setShowModal(false);
    window.history.back();
  };

  return (
    <MasterLayout>
      <div className="main-content">
        <div className="page-content">
          <div className="container-fluid">
            <Breadcrumb title="Cadastro de Curso" pageTitle="Novo Curso" />
            
            <CadastroCursoModal
              show={showModal}
              onHide={handleClose}
              cursoToEdit={null}
              onCursoSaved={handleCursoSaved}
            />
          </div>
        </div>
      </div>
    </MasterLayout>
  );
};

export default PaginaCadastroCurso;
