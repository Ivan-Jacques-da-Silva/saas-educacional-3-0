
import React, { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { API_BASE_URL_NEW } from './config';
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import InputMask from "react-input-mask";

const ViewProfileLayer = () => {
    const [userData, setUserData] = useState({
        cp_nome: "",
        cp_email: "",
        cp_login: "",
        cp_rg: "",
        cp_cpf: "",
        cp_datanascimento: "",
        cp_estadocivil: "",
        cp_cnpj: "",
        cp_ie: "",
        cp_whatsapp: "",
        cp_telefone: "",
        cp_empresaatuacao: "",
        cp_profissao: "",
        cp_end_cidade_estado: "",
        cp_end_rua: "",
        cp_end_num: "",
        cp_end_cep: "",
        cp_descricao: "",
        cp_foto_perfil: ""
    });

    const [previewImage, setPreviewImage] = useState("");
    const [selectedFile, setSelectedFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    useEffect(() => {
        fetchUserProfile();
    }, []);

    const fetchUserProfile = async () => {
        try {
            const userId = localStorage.getItem('userId');
            if (!userId) {
                toast.error("Usuário não encontrado. Faça login novamente.");
                return;
            }

            const response = await axios.get(`${API_BASE_URL_NEW}/api/users/${userId}`);
            setUserData(response.data);
            
            // Definir imagem de preview se existir
            if (response.data.cp_foto_perfil) {
                setPreviewImage(`${API_BASE_URL_NEW}/uploads/${response.data.cp_foto_perfil}`);
            }
        } catch (error) {
            console.error("Erro ao carregar perfil:", error);
            toast.error("Erro ao carregar dados do perfil.");
        }
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onload = (e) => {
                setPreviewImage(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setUserData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const userId = localStorage.getItem('userId');
            const formData = new FormData();

            // Adicionar arquivo de imagem se selecionado
            if (selectedFile) {
                formData.append("cp_foto_perfil", selectedFile);
            }

            // Adicionar outros dados do usuário
            Object.keys(userData).forEach(key => {
                if (key !== "cp_foto_perfil") {
                    formData.append(key, userData[key]);
                }
            });

            const response = await axios.put(`${API_BASE_URL_NEW}/api/edit-user/${userId}`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            });

            if (response.status === 200) {
                toast.success("Perfil atualizado com sucesso!");
                // Atualizar dados no localStorage se necessário
                localStorage.setItem('userName', userData.cp_nome);
                fetchUserProfile(); // Recarregar dados
            }
        } catch (error) {
            console.error("Erro ao atualizar perfil:", error);
            toast.error("Erro ao atualizar perfil. Tente novamente.");
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            toast.error("As senhas não coincidem.");
            return;
        }

        if (newPassword.length < 6) {
            toast.error("A nova senha deve ter pelo menos 6 caracteres.");
            return;
        }

        setLoading(true);

        try {
            const userId = localStorage.getItem('userId');
            const response = await axios.put(`${API_BASE_URL_NEW}/api/change-password/${userId}`, {
                currentPassword,
                newPassword
            });

            if (response.status === 200) {
                toast.success("Senha alterada com sucesso!");
                setCurrentPassword("");
                setNewPassword("");
                setConfirmPassword("");
            }
        } catch (error) {
            console.error("Erro ao alterar senha:", error);
            if (error.response?.status === 400) {
                toast.error("Senha atual incorreta.");
            } else {
                toast.error("Erro ao alterar senha. Tente novamente.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <ToastContainer />
            <div className="card h-100 p-0 radius-12">
                <div className="card-body p-24">
                    <ul className="nav border-gradient-tab nav-pills mb-20 d-inline-flex" id="pills-tab" role="tablist">
                        <li className="nav-item" role="presentation">
                            <button
                                className="nav-link d-flex align-items-center px-24 active"
                                id="pills-edit-profile-tab"
                                data-bs-toggle="pill"
                                data-bs-target="#pills-edit-profile"
                                type="button"
                                role="tab"
                                aria-controls="pills-edit-profile"
                                aria-selected="true"
                            >
                                Editar Perfil
                            </button>
                        </li>
                        <li className="nav-item" role="presentation">
                            <button
                                className="nav-link d-flex align-items-center px-24"
                                id="pills-change-password-tab"
                                data-bs-toggle="pill"
                                data-bs-target="#pills-change-password"
                                type="button"
                                role="tab"
                                aria-controls="pills-change-password"
                                aria-selected="false"
                            >
                                Alterar Senha
                            </button>
                        </li>
                    </ul>

                    <div className="tab-content" id="pills-tabContent">
                        {/* Tab Editar Perfil */}
                        <div className="tab-pane fade show active" id="pills-edit-profile" role="tabpanel" aria-labelledby="pills-edit-profile-tab" tabIndex={0}>
                            <form onSubmit={handleProfileUpdate}>
                                {/* Upload de Imagem */}
                                <div className="mb-24 mt-16">
                                    <div className="avatar-upload">
                                        <div className="avatar-edit position-absolute bottom-0 end-0 me-24 mt-16 z-1 cursor-pointer">
                                            <input
                                                type="file"
                                                id="imageUpload"
                                                accept=".png, .jpg, .jpeg"
                                                hidden
                                                onChange={handleImageUpload}
                                            />
                                            <label
                                                htmlFor="imageUpload"
                                                className="w-32-px h-32-px d-flex justify-content-center align-items-center bg-primary-50 text-primary-600 border border-primary-600 bg-hover-primary-100 text-lg rounded-circle"
                                            >
                                                <Icon icon="solar:camera-outline" className="icon"></Icon>
                                            </label>
                                        </div>
                                        <div className="avatar-preview">
                                            <div
                                                id="imagePreview"
                                                style={{
                                                    width: "120px",
                                                    height: "120px",
                                                    borderRadius: "50%",
                                                    backgroundImage: previewImage ? `url(${previewImage})` : 'url(/assets/images/user.png)',
                                                    backgroundSize: "cover",
                                                    backgroundPosition: "center",
                                                    backgroundRepeat: "no-repeat"
                                                }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col-sm-6">
                                        <div className="mb-20">
                                            <label htmlFor="cp_nome" className="form-label fw-semibold text-primary-light text-sm mb-8">
                                                Nome Completo <span className="text-danger-600">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                className="form-control radius-8"
                                                id="cp_nome"
                                                name="cp_nome"
                                                value={userData.cp_nome}
                                                onChange={handleInputChange}
                                                placeholder="Digite seu nome completo"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="col-sm-6">
                                        <div className="mb-20">
                                            <label htmlFor="cp_email" className="form-label fw-semibold text-primary-light text-sm mb-8">
                                                Email <span className="text-danger-600">*</span>
                                            </label>
                                            <input
                                                type="email"
                                                className="form-control radius-8"
                                                id="cp_email"
                                                name="cp_email"
                                                value={userData.cp_email}
                                                onChange={handleInputChange}
                                                placeholder="Digite seu email"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="col-sm-6">
                                        <div className="mb-20">
                                            <label htmlFor="cp_login" className="form-label fw-semibold text-primary-light text-sm mb-8">
                                                Login
                                            </label>
                                            <input
                                                type="text"
                                                className="form-control radius-8"
                                                id="cp_login"
                                                name="cp_login"
                                                value={userData.cp_login}
                                                onChange={handleInputChange}
                                                placeholder="Digite seu login"
                                            />
                                        </div>
                                    </div>
                                    <div className="col-sm-6">
                                        <div className="mb-20">
                                            <label htmlFor="cp_cpf" className="form-label fw-semibold text-primary-light text-sm mb-8">
                                                CPF
                                            </label>
                                            <InputMask
                                                mask="999.999.999-99"
                                                type="text"
                                                className="form-control radius-8"
                                                id="cp_cpf"
                                                name="cp_cpf"
                                                value={userData.cp_cpf}
                                                onChange={handleInputChange}
                                                placeholder="Digite seu CPF"
                                            />
                                        </div>
                                    </div>
                                    <div className="col-sm-6">
                                        <div className="mb-20">
                                            <label htmlFor="cp_whatsapp" className="form-label fw-semibold text-primary-light text-sm mb-8">
                                                WhatsApp
                                            </label>
                                            <InputMask
                                                mask="(99) 99999-9999"
                                                type="text"
                                                className="form-control radius-8"
                                                id="cp_whatsapp"
                                                name="cp_whatsapp"
                                                value={userData.cp_whatsapp}
                                                onChange={handleInputChange}
                                                placeholder="Digite seu WhatsApp"
                                            />
                                        </div>
                                    </div>
                                    <div className="col-sm-6">
                                        <div className="mb-20">
                                            <label htmlFor="cp_telefone" className="form-label fw-semibold text-primary-light text-sm mb-8">
                                                Telefone
                                            </label>
                                            <InputMask
                                                mask="(99) 99999-9999"
                                                type="text"
                                                className="form-control radius-8"
                                                id="cp_telefone"
                                                name="cp_telefone"
                                                value={userData.cp_telefone}
                                                onChange={handleInputChange}
                                                placeholder="Digite seu telefone"
                                            />
                                        </div>
                                    </div>
                                    <div className="col-sm-6">
                                        <div className="mb-20">
                                            <label htmlFor="cp_end_cidade_estado" className="form-label fw-semibold text-primary-light text-sm mb-8">
                                                Cidade/Estado
                                            </label>
                                            <input
                                                type="text"
                                                className="form-control radius-8"
                                                id="cp_end_cidade_estado"
                                                name="cp_end_cidade_estado"
                                                value={userData.cp_end_cidade_estado}
                                                onChange={handleInputChange}
                                                placeholder="Digite cidade e estado"
                                            />
                                        </div>
                                    </div>
                                    <div className="col-sm-6">
                                        <div className="mb-20">
                                            <label htmlFor="cp_end_rua" className="form-label fw-semibold text-primary-light text-sm mb-8">
                                                Endereço
                                            </label>
                                            <input
                                                type="text"
                                                className="form-control radius-8"
                                                id="cp_end_rua"
                                                name="cp_end_rua"
                                                value={userData.cp_end_rua}
                                                onChange={handleInputChange}
                                                placeholder="Digite seu endereço"
                                            />
                                        </div>
                                    </div>
                                    <div className="col-sm-12">
                                        <div className="mb-20">
                                            <label htmlFor="cp_descricao" className="form-label fw-semibold text-primary-light text-sm mb-8">
                                                Descrição
                                            </label>
                                            <textarea
                                                className="form-control radius-8"
                                                id="cp_descricao"
                                                name="cp_descricao"
                                                rows="4"
                                                value={userData.cp_descricao}
                                                onChange={handleInputChange}
                                                placeholder="Digite uma descrição sobre você"
                                            ></textarea>
                                        </div>
                                    </div>
                                </div>

                                <div className="d-flex align-items-center justify-content-center gap-3">
                                    <button
                                        type="button"
                                        className="border border-danger-600 bg-hover-danger-200 text-danger-600 text-md px-40 py-11 radius-8"
                                        onClick={() => fetchUserProfile()}
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn btn-primary border border-primary-600 text-md px-40 py-11 radius-8"
                                        disabled={loading}
                                    >
                                        {loading ? "Salvando..." : "Salvar Alterações"}
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* Tab Alterar Senha */}
                        <div className="tab-pane fade" id="pills-change-password" role="tabpanel" aria-labelledby="pills-change-password-tab" tabIndex={0}>
                            <form onSubmit={handlePasswordChange}>
                                <div className="row">
                                    <div className="col-sm-12">
                                        <div className="mb-20">
                                            <label htmlFor="currentPassword" className="form-label fw-semibold text-primary-light text-sm mb-8">
                                                Senha Atual <span className="text-danger-600">*</span>
                                            </label>
                                            <input
                                                type="password"
                                                className="form-control radius-8"
                                                id="currentPassword"
                                                value={currentPassword}
                                                onChange={(e) => setCurrentPassword(e.target.value)}
                                                placeholder="Digite sua senha atual"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="col-sm-6">
                                        <div className="mb-20">
                                            <label htmlFor="newPassword" className="form-label fw-semibold text-primary-light text-sm mb-8">
                                                Nova Senha <span className="text-danger-600">*</span>
                                            </label>
                                            <input
                                                type="password"
                                                className="form-control radius-8"
                                                id="newPassword"
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                placeholder="Digite a nova senha"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="col-sm-6">
                                        <div className="mb-20">
                                            <label htmlFor="confirmPassword" className="form-label fw-semibold text-primary-light text-sm mb-8">
                                                Confirmar Nova Senha <span className="text-danger-600">*</span>
                                            </label>
                                            <input
                                                type="password"
                                                className="form-control radius-8"
                                                id="confirmPassword"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                placeholder="Confirme a nova senha"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="d-flex align-items-center justify-content-center gap-3">
                                    <button
                                        type="button"
                                        className="border border-danger-600 bg-hover-danger-200 text-danger-600 text-md px-40 py-11 radius-8"
                                        onClick={() => {
                                            setCurrentPassword("");
                                            setNewPassword("");
                                            setConfirmPassword("");
                                        }}
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn btn-primary border border-primary-600 text-md px-40 py-11 radius-8"
                                        disabled={loading}
                                    >
                                        {loading ? "Alterando..." : "Alterar Senha"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ViewProfileLayer;
