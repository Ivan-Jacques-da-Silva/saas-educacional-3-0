
import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Row, Col, Alert } from "react-bootstrap";
import { toast } from "react-toastify";
import axios from "axios";
import { API_BASE_URL } from "./config";

const CadastroCursoModal = ({ show, onHide, cursoToEdit, onCursoSaved }) => {
  const [formData, setFormData] = useState({
    titulo: "",
    descricao: "",
    instrutorId: "",
    categoria: "",
    nivel: "",
    duracao: "",
    preco: "",
    status: "ativo",
    dataPublicacao: "",
    tags: "",
    arquivo: null
  });

  const [instrutores, setInstrutores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  useEffect(() => {
    if (show) {
      fetchInstrutores();
      if (cursoToEdit) {
        setFormData({
          titulo: cursoToEdit.titulo || "",
          descricao: cursoToEdit.descricao || "",
          instrutorId: cursoToEdit.instrutorId || "",
          categoria: cursoToEdit.categoria || "",
          nivel: cursoToEdit.nivel || "",
          duracao: cursoToEdit.duracao || "",
          preco: cursoToEdit.preco || "",
          status: cursoToEdit.status || "ativo",
          dataPublicacao: cursoToEdit.dataPublicacao ? new Date(cursoToEdit.dataPublicacao).toISOString().split('T')[0] : "",
          tags: cursoToEdit.tags || "",
          arquivo: null
        });
      } else {
        resetForm();
      }
    }
  }, [show, cursoToEdit]);

  const fetchInstrutores = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/users`);
      const instrutoresData = response.data.filter(user => 
        user.tipoUser === "2" || user.tipoUser === "4" // Diretor ou Professor
      );
      setInstrutores(instrutoresData);
    } catch (error) {
      console.error("Erro ao buscar instrutores:", error);
      toast.error("Erro ao carregar instrutores");
    }
  };

  const resetForm = () => {
    setFormData({
      titulo: "",
      descricao: "",
      instrutorId: "",
      categoria: "",
      nivel: "",
      duracao: "",
      preco: "",
      status: "ativo",
      dataPublicacao: "",
      tags: "",
      arquivo: null
    });
    setShowAlert(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({
      ...prev,
      arquivo: e.target.files[0]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      
      Object.keys(formData).forEach(key => {
        if (key === 'arquivo' && formData[key]) {
          formDataToSend.append(key, formData[key]);
        } else if (key !== 'arquivo') {
          formDataToSend.append(key, formData[key]);
        }
      });

      let response;
      if (cursoToEdit) {
        response = await axios.put(`${API_BASE_URL}/api/cursos/${cursoToEdit.id}`, formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      } else {
        response = await axios.post(`${API_BASE_URL}/api/cursos`, formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      }

      if (response.data.exists) {
        setShowAlert(true);
        setAlertMessage(response.data.message);
      } else {
        toast.success(cursoToEdit ? "Curso atualizado com sucesso!" : "Curso cadastrado com sucesso!");
        onCursoSaved();
        onHide();
        resetForm();
      }
    } catch (error) {
      console.error("Erro ao salvar curso:", error);
      toast.error("Erro ao salvar curso. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onHide();
  };

  return (
    <Modal show={show} onHide={handleClose} size="xl" centered>
      <Modal.Header closeButton>
        <Modal.Title>
          {cursoToEdit ? "Editar Curso" : "Cadastrar Novo Curso"}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {showAlert && (
          <Alert variant="warning" onClose={() => setShowAlert(false)} dismissible>
            {alertMessage}
          </Alert>
        )}
        
        <Form onSubmit={handleSubmit}>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Título *</Form.Label>
                <Form.Control
                  type="text"
                  name="titulo"
                  value={formData.titulo}
                  onChange={handleInputChange}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Instrutor</Form.Label>
                <Form.Select
                  name="instrutorId"
                  value={formData.instrutorId}
                  onChange={handleInputChange}
                >
                  <option value="">Selecione um instrutor</option>
                  {instrutores.map(instrutor => (
                    <option key={instrutor.id} value={instrutor.id}>
                      {instrutor.nome}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Categoria</Form.Label>
                <Form.Control
                  type="text"
                  name="categoria"
                  value={formData.categoria}
                  onChange={handleInputChange}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Nível</Form.Label>
                <Form.Select
                  name="nivel"
                  value={formData.nivel}
                  onChange={handleInputChange}
                >
                  <option value="">Selecione o nível</option>
                  <option value="Iniciante">Iniciante</option>
                  <option value="Intermediário">Intermediário</option>
                  <option value="Avançado">Avançado</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Duração</Form.Label>
                <Form.Control
                  type="text"
                  name="duracao"
                  value={formData.duracao}
                  onChange={handleInputChange}
                  placeholder="Ex: 2 horas, 30 minutos"
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Preço</Form.Label>
                <Form.Control
                  type="number"
                  step="0.01"
                  name="preco"
                  value={formData.preco}
                  onChange={handleInputChange}
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Status</Form.Label>
                <Form.Select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                >
                  <option value="ativo">Ativo</option>
                  <option value="inativo">Inativo</option>
                  <option value="rascunho">Rascunho</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Data de Publicação</Form.Label>
                <Form.Control
                  type="date"
                  name="dataPublicacao"
                  value={formData.dataPublicacao}
                  onChange={handleInputChange}
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={12}>
              <Form.Group className="mb-3">
                <Form.Label>Descrição</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="descricao"
                  value={formData.descricao}
                  onChange={handleInputChange}
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Tags</Form.Label>
                <Form.Control
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                  placeholder="Separadas por vírgula"
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Arquivo do Curso</Form.Label>
                <Form.Control
                  type="file"
                  name="arquivo"
                  onChange={handleFileChange}
                  accept="audio/*,video/*,.pdf,.doc,.docx"
                />
              </Form.Group>
            </Col>
          </Row>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Cancelar
        </Button>
        <Button 
          variant="primary" 
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Salvando..." : (cursoToEdit ? "Atualizar" : "Cadastrar")}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default CadastroCursoModal;
