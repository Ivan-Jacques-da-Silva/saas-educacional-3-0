
import React, { useState, useEffect } from "react";
import { Card, Button, Table, Badge } from "react-bootstrap";
import { toast } from "react-toastify";
import axios from "axios";
import { API_BASE_URL } from "./config";
import CadastroCursoModal from "./CadastroCurso";

const CursosLayout = () => {
  const [cursos, setCursos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [cursoToEdit, setCursoToEdit] = useState(null);

  useEffect(() => {
    fetchCursos();
  }, []);

  const fetchCursos = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/cursos`);
      setCursos(response.data);
    } catch (error) {
      console.error("Erro ao buscar cursos:", error);
      toast.error("Erro ao carregar cursos");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (curso) => {
    setCursoToEdit(curso);
    setShowModal(true);
  };

  const handleDelete = async (cursoId) => {
    if (window.confirm("Tem certeza que deseja excluir este curso?")) {
      try {
        await axios.delete(`${API_BASE_URL}/api/cursos/${cursoId}`);
        toast.success("Curso excluído com sucesso!");
        fetchCursos();
      } catch (error) {
        console.error("Erro ao excluir curso:", error);
        toast.error("Erro ao excluir curso");
      }
    }
  };

  const handleNewCurso = () => {
    setCursoToEdit(null);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setCursoToEdit(null);
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'ativo': 'success',
      'inativo': 'danger',
      'rascunho': 'warning'
    };
    return <Badge bg={statusMap[status] || 'secondary'}>{status}</Badge>;
  };

  const formatPrice = (price) => {
    if (!price) return 'Gratuito';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="row">
      <div className="col-12">
        <Card>
          <Card.Header className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Gerenciar Cursos</h5>
            <Button variant="primary" onClick={handleNewCurso}>
              <i className="ri-add-line me-2"></i>
              Novo Curso
            </Button>
          </Card.Header>
          <Card.Body>
            {cursos.length === 0 ? (
              <div className="text-center py-4">
                <p>Nenhum curso cadastrado ainda.</p>
                <Button variant="primary" onClick={handleNewCurso}>
                  Cadastrar Primeiro Curso
                </Button>
              </div>
            ) : (
              <div className="table-responsive">
                <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th>Título</th>
                      <th>Instrutor</th>
                      <th>Categoria</th>
                      <th>Nível</th>
                      <th>Duração</th>
                      <th>Preço</th>
                      <th>Status</th>
                      <th>Data Publicação</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cursos.map((curso) => (
                      <tr key={curso.id}>
                        <td>
                          <div>
                            <strong>{curso.titulo}</strong>
                            {curso.descricao && (
                              <div className="text-muted small">
                                {curso.descricao.length > 100 
                                  ? `${curso.descricao.substring(0, 100)}...`
                                  : curso.descricao
                                }
                              </div>
                            )}
                          </div>
                        </td>
                        <td>
                          {curso.instrutor ? curso.instrutor.nome : 'Não definido'}
                        </td>
                        <td>{curso.categoria || '-'}</td>
                        <td>{curso.nivel || '-'}</td>
                        <td>{curso.duracao || '-'}</td>
                        <td>{formatPrice(curso.preco)}</td>
                        <td>{getStatusBadge(curso.status)}</td>
                        <td>{formatDate(curso.dataPublicacao)}</td>
                        <td>
                          <div className="d-flex gap-2">
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() => handleEdit(curso)}
                              title="Editar"
                            >
                              <i className="ri-edit-line"></i>
                            </Button>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => handleDelete(curso.id)}
                              title="Excluir"
                            >
                              <i className="ri-delete-bin-line"></i>
                            </Button>
                            {curso.arquivo && (
                              <Button
                                variant="outline-success"
                                size="sm"
                                href={`${API_BASE_URL}/uploads/${curso.arquivo}`}
                                target="_blank"
                                title="Baixar arquivo"
                              >
                                <i className="ri-download-line"></i>
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            )}
          </Card.Body>
        </Card>
      </div>

      <CadastroCursoModal
        show={showModal}
        onHide={handleModalClose}
        cursoToEdit={cursoToEdit}
        onCursoSaved={fetchCursos}
      />
    </div>
  );
};

export default CursosLayout;
