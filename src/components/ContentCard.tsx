import React from "react";

interface Conteudo {
  id: number;
  created_at: string;
  conteudo_gerado: string;
  compra_id: number | null;
  plano: {
    nome: string;
    dias: number | string;
  } | null;
}

interface ContentCardProps {
  conteudo: Conteudo;
}

const ContentCard: React.FC<ContentCardProps> = ({ conteudo }) => {
  let dados;
  try {
    dados = JSON.parse(conteudo.conteudo_gerado);
  } catch (error) {
    console.error("Erro ao processar o JSON do conteúdo:", error);
    return (
      <div className="p-4 bg-red-100 text-red-700 rounded-lg">
        Erro ao carregar dados.
      </div>
    );
  }

  const analise = dados.analiseEstrategica;

  // A função para formatar a data também continua a mesma.
  const formatarData = (dataIso: string): string => {
    if (!dataIso) return "Data indisponível";
    return new Date(dataIso).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden h-full flex flex-col transition-shadow hover:shadow-lg">
      <div className="p-6 flex-grow">
        <div className="flex justify-between items-start mb-4">
          {/*Dias gerados*/}
          <span
            className={`px-3 py-1 text-xs font-semibold rounded-full ${
              conteudo.compra_id === null
                ? "bg-green-100 text-green-800"
                : "bg-blue-100 text-blue-800"
            }`}
          >
            {conteudo.plano ? `${conteudo.plano.dias} Dias` : "Plano"}
          </span>
        </div>

        {/*Titulo do Card*/}
        <h2 className="text-xl font-bold text-gray-800 mb-1">
          {analise.tituloEstrategia || "Agenda de Conteúdo"}
        </h2>

        {/*Data de criacao*/}
        <p className="text-sm text-gray-500 mb-4">
          Criado em: {formatarData(conteudo.created_at)}
        </p>

        {/*Legenda do Card*/}
        <p className="text-gray-600 text-base leading-relaxed italic">
          "{analise ? analise.justificativa : "Justificativa indisponível."}"
        </p>
      </div>

      {/*Botoes de acao*/}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
        <div className="flex space-x-3">
          <button className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200">
            Ver Completo
          </button>
          <button className="px-4 py-2 bg-gray-200 text-gray-800 text-sm font-medium rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-colors duration-200">
            Copiar Texto
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContentCard;
