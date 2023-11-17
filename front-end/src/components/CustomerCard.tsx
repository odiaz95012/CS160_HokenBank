import React from 'react';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import { ListGroup, ListGroupItem } from 'react-bootstrap';


interface CustomerCardProps {
    customer_id: number,
    full_name: string,
    username: string,
    email: string,
    age: number,
    gender: string,
    zip_code: number,
    status: string,
    generateUserReport: (customerID: number) => void
}

function CustomerCard({ customer_id, full_name, username, email, age, gender, zip_code, status, generateUserReport }: CustomerCardProps): JSX.Element {
    return (
        <Card style={{ width: '25rem' }}>
            <Card.Body>
                <Card.Title>{full_name}</Card.Title>
                <ListGroup variant="flush">
                    <ListGroup.Item>Customer ID: {customer_id}</ListGroup.Item>
                    <ListGroup.Item>Username: {username}</ListGroup.Item>
                    <ListGroup.Item>Email: {email}</ListGroup.Item>
                    <ListGroup.Item>Age: {age}</ListGroup.Item>
                    <ListGroup.Item>Gender: {gender}</ListGroup.Item>
                    <ListGroup.Item>Zip Code: {zip_code}</ListGroup.Item>
                    <ListGroup.Item>Status: {status}</ListGroup.Item>
                </ListGroup>
                {status === 'A' ? (
                    <Button variant="outline-primary" onClick={() => generateUserReport(customer_id)}>
                        <i className="bi bi-file-earmark-arrow-down pe-1"></i>Download User Report
                    </Button>
                ) : null}
            </Card.Body>
        </Card>
    );
}

export default CustomerCard;