provider "aws" {
  region = "us-east-1" # or your preferred region
}

resource "aws_key_pair" "deployer" {
  key_name   = "deployer-key"
  public_key = file("~/.ssh/id_rsa.pub")  # your local pub key
}

resource "aws_security_group" "web_sg" {
  name        = "web-sg"
  description = "Allow HTTP, HTTPS, and SSH"
  ingress = [
    {
      from_port   = 22
      to_port     = 22
      protocol    = "tcp"
      cidr_blocks = ["0.0.0.0/0"]
    },
    {
      from_port   = 3000
      to_port     = 3000
      protocol    = "tcp"
      cidr_blocks = ["0.0.0.0/0"]
    },
    {
      from_port   = 8000
      to_port     = 8000
      protocol    = "tcp"
      cidr_blocks = ["0.0.0.0/0"]
    }
  ]
  egress = [
    {
      from_port   = 0
      to_port     = 0
      protocol    = "-1"
      cidr_blocks = ["0.0.0.0/0"]
    }
  ]
}

resource "aws_instance" "app_server" {
  ami                    = "ami-0c02fb55956c7d316" # Ubuntu 22.04 LTS (update as needed)
  instance_type          = "t2.micro"
  key_name               = aws_key_pair.deployer.key_name
  vpc_security_group_ids = [aws_security_group.web_sg.id]

  user_data = file("ec2-user-data.sh")

  tags = {
    Name = "AIQ-FullStack-Server"
  }
}
