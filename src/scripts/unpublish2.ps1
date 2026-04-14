# Fun��o para verificar se o PowerShell est� rodando com permiss�es de administrador
function Check-Admin {
    $isAdmin = (New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
    if (-not $isAdmin) {
        Write-Host "O script não esta sendo executado como Administrador. Tentando reiniciar com privilegios de Administrador..." -ForegroundColor yellow
        
        # Obter o caminho completo do script atual
        $scriptPath = $MyInvocation.MyCommand.Path
        if (-not $scriptPath) {
            $scriptPath = $PSCommandPath  # Se o caminho n�o for encontrado, tentamos uma abordagem alternativa
        }
        
        if ($scriptPath) {
            # Iniciar o PowerShell com o script atual, passando como argumento
            $arguments = "-NoExit", "-Command", "& '$scriptPath'"
            Start-Process powershell -ArgumentList $arguments -Verb runAs
            exit
        } else {
            Write-Host "Erro: Não foi possivel obter o caminho do script." -ForegroundColor red
            exit
        }
    }
}

# Fun��o principal de despublicando
function DespublicarVersao {
    # Nome do pacote
    $packageName = "npm-package-nodejs-utils-lda"
    $url = "https://registry.npmjs.org/$packageName"

    Write-Host "Buscando... $url" -ForegroundColor green
    # Baixar os dados JSON do pacote
    $response = Invoke-RestMethod -Uri "$url" -Method Get

    # Verificar se a resposta foi obtida com sucesso
    if ($response) {
        Write-Host "Sucesso ao obter dados da API." -ForegroundColor green
    } else {
        Write-Host "Erro ao obter dados da API." -ForegroundColor red
        exit
    }

    # Exibir as versoes disponiveis
    Write-Host "Exibindo versoes disponiveis:"
    $versions = $response.versions.PSObject.Properties.Name
    $counter = 1

    # Exibir as versoes para o usuario
    foreach ($version in $versions) {
        Write-Host "$counter - $version" -ForegroundColor blue
        $counter++
    }

    # Solicitar ao usuario para escolher uma versao
    $choice = Read-Host "Escolha a versao para despublicar (1-para despublicar versao)"

    # Validar a escolha
    if ($choice -ge 1 -and $choice -le $versions.Count) {
        $versionToDelete = $versions[$choice - 1]
        Write-Host "Voce escolheu despublicar a versao: $versionToDelete"

        # Confirmar despublicando
        $confirm = Read-Host "Tem certeza que deseja despublicar esta versao? (s/n)"

        if ($confirm -eq "s") {
            Write-Host "Despublicando a versao $versionToDelete..." -ForegroundColor Yellow 
            Write-Host "Command: npm unpublish $packageName@$versionToDelete" -ForegroundColor red 

            # Descomente a linha abaixo para executar o comando de despublicando
             npm unpublish $packageName@$versionToDelete
            Write-Host "Versao Despublicada!" -ForegroundColor red 
            pause
        } else {
            Write-Host "Despublicando cancelada."
        }
    } else {
        Write-Host "Escolha invalida."
    }
}

# Verifica se est� sendo executado como Administrador
Check-Admin

# Loop principal
do {
    DespublicarVersao
    
    # Perguntar se o usuario deseja despublicar outra versao
    # $continue = Read-Host "Deseja despublicar outra versao? (s/n)"
    $continue = "s"
    clear
} while ($continue -eq "s")

Write-Host "Saindo do script..." -ForegroundColor red
exit