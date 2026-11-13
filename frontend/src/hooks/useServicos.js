import { useEffect, useState } from "react";
import {
  atualizarServico,
  buscarServico,
  criarServico,
  excluirServico,
  listarServicos,
  substituirServico,
} from "../services/servicos";

export function useServicos() {
  const [servicos, setServicos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [servicoEmEdicao, setServicoEmEdicao] = useState(null);
  const [servicoConsultado, setServicoConsultado] = useState(null);
  const [executandoOperacao, setExecutandoOperacao] = useState(false);

  useEffect(() => {
    let componenteMontado = true;
    carregarServicos();
    return () => {
      componenteMontado = false;
    };

    async function carregarServicos() {
      try {
        const servicosCarregados = await listarServicos();
        if (componenteMontado) setServicos(servicosCarregados);
      } catch (erroCarregamento) {
        if (componenteMontado) setErro(erroCarregamento.message);
      } finally {
        if (componenteMontado) setCarregando(false);
      }
    }
  }, []);

  return {
    servicos,
    carregando,
    erro,
    servicoEmEdicao,
    servicoConsultado,
    executandoOperacao,
    salvarServico,
    consultarServico,
    editarServico,
    alterarSituacao,
    removerServico,
    cancelarEdicao: () => setServicoEmEdicao(null),
    fecharDetalhes: () => setServicoConsultado(null),
  };

  async function salvarServico(dadosServico) {
    setErro("");
    // O formulário trata a falha e só limpa os campos após o sucesso.
    if (servicoEmEdicao) {
      const servicoAtualizado = await substituirServico(
        servicoEmEdicao.id,
        dadosServico,
      );
      atualizarLista(servicoAtualizado);
      setServicoEmEdicao(null);
      return;
    }
    const servicoCriado = await criarServico(dadosServico);
    setServicos((servicosAtuais) => [...servicosAtuais, servicoCriado]);
  }

  function consultarServico(servico) {
    return executarOperacao(async () => {
      const servicoEncontrado = await buscarServico(servico.id);
      setServicoConsultado(servicoEncontrado);
    });
  }

  function editarServico(servico) {
    return executarOperacao(async () => {
      const servicoEncontrado = await buscarServico(servico.id);
      setServicoEmEdicao(servicoEncontrado);
    });
  }

  function alterarSituacao(servico) {
    return executarOperacao(async () => {
      const servicoAtualizado = await atualizarServico(servico.id, {
        ativo: !servico.ativo,
      });
      atualizarLista(servicoAtualizado);
      if (servicoEmEdicao?.id === servico.id) setServicoEmEdicao(null);
    });
  }

  function removerServico(servico) {
    return executarOperacao(async () => {
      await excluirServico(servico.id);
      setServicos((servicosAtuais) =>
        servicosAtuais.filter((servicoAtual) => servicoAtual.id !== servico.id),
      );
      if (servicoEmEdicao?.id === servico.id) setServicoEmEdicao(null);
      if (servicoConsultado?.id === servico.id) setServicoConsultado(null);
    });
  }

  function atualizarLista(servicoAtualizado) {
    setServicos((servicosAtuais) =>
      servicosAtuais.map((servico) =>
        servico.id === servicoAtualizado.id ? servicoAtualizado : servico,
      ),
    );
    setServicoConsultado((servico) =>
      servico?.id === servicoAtualizado.id ? servicoAtualizado : servico,
    );
  }

  async function executarOperacao(operacao) {
    setExecutandoOperacao(true);
    setErro("");
    try {
      await operacao();
    } catch (erroOperacao) {
      setErro(erroOperacao.message);
    } finally {
      setExecutandoOperacao(false);
    }
  }
}
