<?php
    $usuario = $_GET['user'] ?? 'Não informado';
    $senha = $_GET['password'] ?? 'Não informada';
    echo "O usuario é: $usuario <br>";
    echo "A senha é: $senha";
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cadastro</title>     
    <style>
        h1 {
            color: green;
        }
    </style>    
</head>
<body>
    <h1>Cadastro Realizado</h1>
</body>
</html>
