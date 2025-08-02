import React, { useState } from "react";
import { Loader2 } from "lucide-react";
import TimedSnackbar from "./TimedSnackbar";
// 1. Importamos nosso formulário reutilizável
import ContentForm from "./ContentForm";

const PaidContentForm: React.FC = () => {
  // Toda a sua lógica de estados e de chamada da API permanece aqui, no componente "inteligente".
  const [formData, setFormData] = useState({
    setor: "",
    tipoNegocio: "",
    objetivoPrincipal: "",
  });
  const [priceId, setPriceId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  type SubmitStatus = { type: "error" | "success"; message: string } | null;
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setSubmitStatus(null);

    if (
      !formData.setor ||
      !formData.tipoNegocio ||
      !formData.objetivoPrincipal ||
      !priceId
    ) {
      setSubmitStatus({
        type: "error",
        message: "Por favor, preencha todos os campos e selecione um plano.",
      });
      setIsLoading(false);
      return;
    }

    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
      const token = localStorage.getItem("authToken");
      if (!userInfo.id || !token) {
        throw new Error("Autenticação não encontrada. Faça o login novamente.");
      }

      const response = await fetch(
        "http://localhost:3000/api/pagamentos/checkout",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            priceId: priceId,
            usuarioId: userInfo.id,
            promptData: formData,
          }),
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Falha ao iniciar o pagamento.");
      }
      window.location.href = data.checkoutUrl;
    } catch (err: unknown) {
      let errorMessage = "Ocorreu um erro.";
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      setSubmitStatus({ type: "error", message: errorMessage });
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="bg-white p-8 rounded-xl shadow-md max-w-2xl mx-auto">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Gerar Mais Conteúdo
          </h2>
          <p className="text-gray-600 mb-6">
            Selecione um dos nossos planos pagos para continuar criando
            estratégias de conteúdo incríveis.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* --- 2. A MUDANÇA PRINCIPAL ACONTECE AQUI --- */}
          {/* Substituímos os 3 inputs repetidos pelo nosso componente reutilizável. */}
          <ContentForm formData={formData} onFormChange={handleInputChange} />

          {/* A seleção de planos continua aqui, pois é específica deste formulário. */}
          <div className="border-t pt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Selecione a quantidade de dias:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Lembre-se de substituir pelos seus IDs de Preço reais! */}
              <label
                className={`block p-4 border rounded-lg cursor-pointer text-center ${
                  priceId === "price_1RkvTvPphAIQfHkyLv2HNYci"
                    ? "border-blue-500 ring-2 ring-blue-500"
                    : "border-gray-300"
                }`}
              >
                <input
                  type="radio"
                  name="plano"
                  value="price_1RkvTvPphAIQfHkyLv2HNYci"
                  className="sr-only"
                  onChange={(e) => setPriceId(e.target.value)}
                />
                <span className="text-lg font-semibold">30 Dias</span>
              </label>
              <label
                className={`block p-4 border rounded-lg cursor-pointer text-center ${
                  priceId === "price_1RlVzHPphAIQfHkypaLBoAxR"
                    ? "border-blue-500 ring-2 ring-blue-500"
                    : "border-gray-300"
                }`}
              >
                <input
                  type="radio"
                  name="plano"
                  value="price_1RlVzHPphAIQfHkypaLBoAxR"
                  className="sr-only"
                  onChange={(e) => setPriceId(e.target.value)}
                />
                <span className="text-lg font-semibold">60 Dias</span>
              </label>
              <label
                className={`block p-4 border rounded-lg cursor-pointer text-center ${
                  priceId === "price_1RlW0CPphAIQfHkyzHVlqqyx"
                    ? "border-blue-500 ring-2 ring-blue-500"
                    : "border-gray-300"
                }`}
              >
                <input
                  type="radio"
                  name="plano"
                  value="price_1RlW0CPphAIQfHkyzHVlqqyx"
                  className="sr-only"
                  onChange={(e) => setPriceId(e.target.value)}
                />
                <span className="text-lg font-semibold">90 Dias</span>
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 transition flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin h-5 w-5 mr-2" /> Redirecionando
                para Pagamento...
              </>
            ) : (
              "Comprar e Gerar Conteúdo"
            )}
          </button>
        </form>
      </div>

      <TimedSnackbar
        status={submitStatus}
        onClose={() => setSubmitStatus(null)}
      />
    </>
  );
};

export default PaidContentForm;
