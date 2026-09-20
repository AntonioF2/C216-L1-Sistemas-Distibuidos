def criar_relatorio_saude(
    servico: str,
    status: str = "ok",
) -> dict[str, str]:
    nome = servico.strip()

    if not nome:
        raise ValueError("O nome do serviço é obrigatório")

    if status not in {"ok", "degraded", "error"}:
        raise ValueError("Status de saúde inválido")

    return {
        "service": nome,
        "status": status,
    }
