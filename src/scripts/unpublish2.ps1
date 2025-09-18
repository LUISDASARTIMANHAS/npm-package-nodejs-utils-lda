# Fun��o para verificar se o PowerShell est� rodando com permiss�es de administrador
function Check-Admin {
    $isAdmin = (New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
    if (-not $isAdmin) {
        Write-Host "O script n�o est� sendo executado como Administrador. Tentando reiniciar com privil�gios de Administrador..." -ForegroundColor yellow
        
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
            Write-Host "Erro: N�o foi poss�vel obter o caminho do script." -ForegroundColor red
            exit
        }
    }
}

# Fun��o principal de despublica��o
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

    # Exibir as vers�es dispon�veis
    Write-Host "Exibindo vers�es dispon�veis:"
    $versions = $response.versions.PSObject.Properties.Name
    $counter = 1

    # Exibir as vers�es para o usu�rio
    foreach ($version in $versions) {
        Write-Host "$counter - $version" -ForegroundColor blue
        $counter++
    }

    # Solicitar ao usu�rio para escolher uma vers�o
    $choice = Read-Host "Escolha a vers�o para despublicar (1-para despublicar vers�o)"

    # Validar a escolha
    if ($choice -ge 1 -and $choice -le $versions.Count) {
        $versionToDelete = $versions[$choice - 1]
        Write-Host "Voc� escolheu despublicar a vers�o: $versionToDelete"

        # Confirmar despublica��o
        $confirm = Read-Host "Tem certeza que deseja despublicar esta vers�o? (s/n)"

        if ($confirm -eq "s") {
            Write-Host "Despublicando a vers�o $versionToDelete..." -ForegroundColor Yellow 
            Write-Host "Command: npm unpublish $packageName@$versionToDelete" -ForegroundColor red 

            # Descomente a linha abaixo para executar o comando de despublica��o
             npm unpublish $packageName@$versionToDelete
            Write-Host "Vers�o Despublicada!" -ForegroundColor red 
            pause
        } else {
            Write-Host "Despublica��o cancelada."
        }
    } else {
        Write-Host "Escolha inv�lida."
    }
}

# Verifica se est� sendo executado como Administrador
Check-Admin

# Loop principal
do {
    DespublicarVersao
    
    # Perguntar se o usu�rio deseja despublicar outra vers�o
    # $continue = Read-Host "Deseja despublicar outra vers�o? (s/n)"
    $continue = "s"
    clear
} while ($continue -eq "s")

Write-Host "Saindo do script..." -ForegroundColor red
exit