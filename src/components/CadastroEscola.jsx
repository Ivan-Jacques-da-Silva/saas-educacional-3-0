import { useState, useEffect } from "react";
import { API_BASE_URL_NEW } from './config';
import axios from "axios";
import { Row, Col, Button, Modal } from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";

const CadastroEscolaModal = ({ escolaId, isModal = false, onClose = null, onEscolaCreated = null }) => {
    const navigate = useNavigate();

    const [escolaData, setEscolaData] = useState({
        nome: "",
        dataCadastro: new Date().toISOString().split('T')[0],
        responsavelId: "",
        cidade: "",
        bairro: "",
        estado: "",
        rua: "",
        numero: "",
        descricao: ""
    });

    const [usuarios, setUsuarios] = useState([]);
    const [showModal, setShowModal] = useState(false);

    const estados = [
        { value: "AC", label: "Acre" },
        { value: "AL", label: "Alagoas" },
        { value: "AP", label: "Amapá" },
        { value: "AM", label: "Amazonas" },
        { value: "BA", label: "Bahia" },
        { value: "CE", label: "Ceará" },
        { value: "DF", label: "Distrito Federal" },
        { value: "ES", label: "Espírito Santo" },
        { value: "GO", label: "Goiás" },
        { value: "MA", label: "Maranhão" },
        { value: "MT", label: "Mato Grosso" },
        { value: "MS", label: "Mato Grosso do Sul" },
        { value: "MG", label: "Minas Gerais" },
        { value: "PA", label: "Pará" },
        { value: "PB", label: "Paraíba" },
        { value: "PR", label: "Paraná" },
        { value: "PE", label: "Pernambuco" },
        { value: "PI", label: "Piauí" },
        { value: "RJ", label: "Rio de Janeiro" },
        { value: "RN", label: "Rio Grande do Norte" },
        { value: "RS", label: "Rio Grande do Sul" },
        { value: "RO", label: "Rondônia" },
        { value: "RR", label: "Roraima" },
        { value: "SC", label: "Santa Catarina" },
        { value: "SP", label: "São Paulo" },
        { value: "SE", label: "Sergipe" },
        { value: "TO", label: "Tocantins" }
    ];

    const handleShowModal = () => setShowModal(true);
    const handleCloseModal = () => {
        setShowModal(false);
        if (onClose) onClose();
    };

    // Buscar usuários com perfil de diretor (tipoUser = 2)
    const fetchUsuarios = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL_NEW}/api/users`);
            const diretores = response.data.filter(user => user.tipoUser === "2" || user.tipoUser === 2);
            setUsuarios(diretores);
        } catch (error) {
            console.error("Erro ao buscar usuários:", error);
            toast.error("Erro ao carregar usuários.");
        }
    };

    useEffect(() => {
        fetchUsuarios();

        if (escolaId) {
            axios.get(`${API_BASE_URL_NEW}/api/escolas/${escolaId}`)
                .then(response => {
                    const escola = response.data;
                    setEscolaData({
                        nome: escola.nome || "",
                        dataCadastro: escola.dataCadastro ? escola.dataCadastro.split('T')[0] : new Date().toISOString().split('T')[0],
                        responsavelId: escola.responsavelId || "",
                        cidade: escola.cidade || "",
                        bairro: escola.bairro || "",
                        estado: escola.estado || "",
                        rua: escola.rua || "",
                        numero: escola.numero || "",
                        descricao: escola.descricao || ""
                    });
                })
                .catch(error => {
                    console.error("Erro ao buscar escola:", error);
                    toast.error("Erro ao carregar os dados da escola.");
                });
        }
    }, [escolaId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEscolaData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!escolaData.nome.trim()) {
            toast.error("Nome da escola é obrigatório.");
            return;
        }

        if (!escolaData.cidade.trim()) {
            toast.error("Cidade é obrigatória.");
            return;
        }

        try {
            if (escolaId) {
                // Modo de edição
                const response = await axios.put(`${API_BASE_URL_NEW}/api/escolas/${escolaId}`, escolaData, {
                    headers: { "Content-Type": "application/json" },
                });

                if (response.status === 200) {
                    toast.success("Escola editada com sucesso!");
                    handleCloseModal();
                    if (!isModal) navigate("/escolas");
                } else {
                    toast.error("Erro ao editar escola.");
                }
            } else {
                // Modo de cadastro
                const response = await axios.post(`${API_BASE_URL_NEW}/api/escolas`, escolaData, {
                    headers: { "Content-Type": "application/json" },
                });

                if (response.data.exists) {
                    toast.error("Escola já cadastrada");
                } else {
                    toast.success("Escola cadastrada com sucesso!");

                    // Se for modal, passar a escola criada para o componente pai
                    if (isModal && onEscolaCreated) {
                        onEscolaCreated(response.data.escola);
                    }

                    // Resetar campos
                    setEscolaData({
                        nome: "",
                        dataCadastro: new Date().toISOString().split('T')[0],
                        responsavelId: "",
                        cidade: "",
                        bairro: "",
                        estado: "",
                        rua: "",
                        numero: "",
                        descricao: ""
                    });

                    if (!isModal) {
                        navigate("/escolas");
                    } else {
                        handleCloseModal();
                    }
                }
            }
        } catch (error) {
            console.error("Erro ao salvar:", error.response?.data || error.message);
            toast.error("Erro ao salvar escola. Tente novamente.");
        }
    };

    const FormContent = () => (
        <form onSubmit={handleSubmit}>
            <Row>
                <Col md={12}>
                    <div className="card">
                        <div className="card-header">
                            <h6 className="card-title mb-0">Informações da Escola</h6>
                        </div>
                        <div className="card-body">
                            <Row className="gy-3">
                                <Col md={6}>
                                    <label htmlFor="nome">Nome da Escola<span className="required">*</span>:</label>
                                    <input
                                        type="text"
                                        id="nome"
                                        name="nome"
                                        value={escolaData.nome}
                                        onChange={handleChange}
                                        className="form-control"
                                        placeholder="Nome da Escola"
                                        required
                                    />
                                </Col>
                                <Col md={6}>
                                    <label htmlFor="dataCadastro">Data de Cadastro<span className="required">*</span>:</label>
                                    <input
                                        type="date"
                                        id="dataCadastro"
                                        name="dataCadastro"
                                        value={escolaData.dataCadastro}
                                        onChange={handleChange}
                                        className="form-control"
                                        required
                                    />
                                </Col>
                                <Col md={12}>
                                    <label htmlFor="responsavelId">Responsável<span className="required">*</span>:</label>
                                    <select
                                        id="responsavelId"
                                        name="responsavelId"
                                        value={escolaData.responsavelId}
                                        onChange={handleChange}
                                        className="form-control"
                                        required
                                    >
                                        <option value="">Selecione o responsável</option>
                                        {usuarios.map((usuario) => (
                                            <option key={usuario.id} value={usuario.id}>
                                                {usuario.nome}
                                            </option>
                                        ))}
                                    </select>
                                </Col>
                            </Row>
                        </div>
                    </div>
                </Col>

                <Col md={12} className="mt-4">
                    <div className="card">
                        <div className="card-header">
                            <h6 className="card-title mb-0">Endereço</h6>
                        </div>
                        <div className="card-body">
                            <Row className="gy-3">
                                <Col md={6}>
                                    <label htmlFor="cidade">Cidade<span className="required">*</span>:</label>
                                    <input
                                        type="text"
                                        id="cidade"
                                        name="cidade"
                                        value={escolaData.cidade}
                                        onChange={handleChange}
                                        className="form-control"
                                        placeholder="Cidade"
                                        required
                                    />
                                </Col>
                                <Col md={6}>
                                    <label htmlFor="bairro">Bairro<span className="required">*</span>:</label>
                                    <input
                                        type="text"
                                        id="bairro"
                                        name="bairro"
                                        value={escolaData.bairro}
                                        onChange={handleChange}
                                        className="form-control"
                                        placeholder="Bairro"
                                        required
                                    />
                                </Col>
                                <Col md={4}>
                                    <label htmlFor="estado">Estado<span className="required">*</span>:</label>
                                    <select
                                        id="estado"
                                        name="estado"
                                        value={escolaData.estado}
                                        onChange={handleChange}
                                        className="form-control"
                                        required
                                    >
                                        <option value="">Selecione o estado</option>
                                        {estados.map((estado) => (
                                            <option key={estado.value} value={estado.value}>
                                                {estado.label}
                                            </option>
                                        ))}
                                    </select>
                                </Col>
                                <Col md={6}>
                                    <label htmlFor="rua">Rua<span className="required">*</span>:</label>
                                    <input
                                        type="text"
                                        id="rua"
                                        name="rua"
                                        value={escolaData.rua}
                                        onChange={handleChange}
                                        className="form-control"
                                        placeholder="Rua"
                                        required
                                    />
                                </Col>
                                <Col md={2}>
                                    <label htmlFor="numero">Número<span className="required">*</span>:</label>
                                    <input
                                        type="text"
                                        id="numero"
                                        name="numero"
                                        value={escolaData.numero}
                                        onChange={handleChange}
                                        className="form-control"
                                        placeholder="Nº"
                                        required
                                    />
                                </Col>
                            </Row>
                        </div>
                    </div>
                </Col>

                <Col md={12} className="mt-4">
                    <div className="card">
                        <div className="card-header">
                            <h6 className="card-title mb-0">Detalhes Adicionais</h6>
                        </div>
                        <div className="card-body">
                            <Row className="gy-3">
                                <Col md={12}>
                                    <label htmlFor="descricao">Descrição:</label>
                                    <textarea
                                        id="descricao"
                                        name="descricao"
                                        value={escolaData.descricao}
                                        onChange={handleChange}
                                        className="form-control"
                                        placeholder="Descrição da escola"
                                        rows="4"
                                    />
                                </Col>
                            </Row>
                        </div>
                    </div>
                </Col>
            </Row>

            <div className="mt-4 text-center">
                <button type="button" className="btn btn-primary" onClick={handleShowModal}>
                    {escolaId ? "Salvar Edição" : "Cadastrar Escola"}
                </button>
            </div>

            <Modal show={showModal} onHide={handleCloseModal} centered>
                <Modal.Header closeButton>
                    <Modal.Title>{escolaId ? "Confirmar Edição" : "Confirmar Cadastro"}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {escolaId ? "Tem certeza que deseja salvar as alterações desta escola?" : "Tem certeza que deseja cadastrar esta escola?"}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseModal}>
                        Cancelar
                    </Button>
                    <Button variant="primary" onClick={handleSubmit}>
                        {escolaId ? "Salvar Alterações" : "Cadastrar"}
                    </Button>
                </Modal.Footer>
            </Modal>
        </form>
    );

    if (isModal) {
        return <FormContent />;
    }

    return (
        <div>
            <ToastContainer />
            <FormContent />
        </div>
    );
};

export default CadastroEscolaModal;