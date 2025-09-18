# Função para verificar se o PowerShell está rodando com permissões de administrador
function Check-Admin {
    $isAdmin = (New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
    if (-not $isAdmin) {
        Write-Host "O script não está sendo executado como Administrador. Tentando reiniciar com privilégios de Administrador..." -ForegroundColor yellow
        
        # Obter o caminho completo do script atual
        $scriptPath = $MyInvocation.MyCommand.Path
        if (-not $scriptPath) {
            $scriptPath = $PSCommandPath  # Se o caminho não for encontrado, tentamos uma abordagem alternativa
        }
        
        if ($scriptPath) {
            # Iniciar o PowerShell com o script atual, passando como argumento
            $arguments = "-NoExit", "-Command", "& '$scriptPath'"
            Start-Process powershell -ArgumentList $arguments -Verb runAs
            exit
        } else {
            Write-Host "Erro: Não foi possível obter o caminho do script." -ForegroundColor red
            exit
        }
    }
}

# Função principal de despublicação
function DespublicarVersao {
    # Nome do pacote
    $packageName = "npm-package-nodejs-utils-lda"

    # Baixar os dados JSON do pacote
    $response = Invoke-RestMethod -Uri "https://registry.npmjs.org/$packageName"

    # Verificar se a resposta foi obtida com sucesso
    if ($response) {
        Write-Host "Sucesso ao obter dados da API." -ForegroundColor green
    } else {
        Write-Host "Erro ao obter dados da API." -ForegroundColor red
        exit
    }

    # Exibir as versões disponíveis
    Write-Host "Exibindo versões disponíveis:"
    $versions = $response.versions.PSObject.Properties.Name
    $counter = 1

    # Exibir as versões para o usuário
    foreach ($version in $versions) {
        Write-Host "$counter - $version" -ForegroundColor blue
        $counter++
    }

    # Solicitar ao usuário para escolher uma versão
    $choice = Read-Host "Escolha a versão para despublicar (1-para despublicar versão)"

    # Validar a escolha
    if ($choice -ge 1 -and $choice -le $versions.Count) {
        $versionToDelete = $versions[$choice - 1]
        Write-Host "Você escolheu despublicar a versão: $versionToDelete"

        # Confirmar despublicação
        $confirm = Read-Host "Tem certeza que deseja despublicar esta versão? (s/n)"

        if ($confirm -eq "s") {
            Write-Host "Despublicando a versão $versionToDelete..." -ForegroundColor Yellow 
            Write-Host "Command: npm unpublish $packageName@$versionToDelete" -ForegroundColor red 

            # Descomente a linha abaixo para executar o comando de despublicação
             npm unpublish $packageName@$versionToDelete
            Write-Host "Versão Despublicada!" -ForegroundColor red 
            pause
        } else {
            Write-Host "Despublicação cancelada."
        }
    } else {
        Write-Host "Escolha inválida."
    }
}

# Verifica se está sendo executado como Administrador
Check-Admin

# Loop principal
do {
    DespublicarVersao
    
    # Perguntar se o usuário deseja despublicar outra versão
    # $continue = Read-Host "Deseja despublicar outra versão? (s/n)"
    $continue = "s"
    clear
} while ($continue -eq "s")

Write-Host "Saindo do script..." -ForegroundColor red
exit