REPORTS_SQL = {
    "revenue": """
        SELECT 
            o.id as order_number,
            ac.full_name as client_name,
            SUM(oi.quantity) as total_product,
            SUM(oi.quantity * oi.price) - o.bonuses_spent as total_price,
            to_char(o.created_at, 'dd.mm.yyyy') as date_order
        FROM order_order o
        JOIN order_orderitem oi ON o.id = oi.order_id
        JOIN account_user ac ON ac.id = o.user_id
        WHERE o.is_completed = TRUE AND o.created_at BETWEEN %s AND %s
        GROUP BY o.id, 
            ac.full_name, 
            o.bonuses_spent, 
            o.created_at
        ORDER BY o.created_at DESC;
    """,

    "popular_items": """
        WITH ValidSales AS (
            SELECT 
                oi.product_id,
                oi.quantity,
                oi.price,
                o.bonuses_spent,
                og.full_order_price
            FROM order_orderitem oi
            JOIN order_order o ON oi.order_id = o.id
            JOIN (
                SELECT order_id, SUM(quantity * price) AS full_order_price
                FROM order_orderitem
                GROUP BY order_id
            ) og ON og.order_id = o.id
            WHERE o.is_completed = TRUE AND o.created_at BETWEEN %s AND %s
        )

        SELECT 
            p.id,
            p.name as item_name, 
            COALESCE(SUM(vs.quantity), 0) as sold_count,
            COALESCE(SUM(vs.quantity * vs.price), 0) as gross_sum,
            
            COALESCE(ROUND(SUM(
                (vs.quantity * vs.price) - 
                ((vs.quantity * vs.price)::numeric / NULLIF(vs.full_order_price, 0)) * vs.bonuses_spent
            ), 2), 0) as net_sum
            
        FROM menu_product p
        JOIN ValidSales vs ON p.id = vs.product_id
        GROUP BY p.id, p.name
        ORDER BY net_sum DESC, item_name ASC;
    """,
    
    "popular_menu": """
        WITH ValidSales AS (
            SELECT 
                oi.product_id,
                oi.quantity,
                oi.price,
                o.bonuses_spent,
                og.full_order_price
            FROM order_orderitem oi
            JOIN order_order o ON oi.order_id = o.id
            JOIN (
                SELECT order_id, SUM(quantity * price) AS full_order_price
                FROM order_orderitem
                GROUP BY order_id
            ) og ON og.order_id = o.id
            WHERE o.is_completed = TRUE AND o.created_at BETWEEN %s AND %s
        )

        SELECT 
            m.id,
            m.name as item_name, 
            COALESCE(SUM(vs.quantity), 0) as sold_count,
            COALESCE(SUM(vs.quantity * vs.price), 0) as total_sum
        FROM menu_menu m
        JOIN menu_product p ON m.id = p.menu_id
        JOIN ValidSales vs ON p.id = vs.product_id
        GROUP BY m.id, m.name
        ORDER BY total_sum DESC, item_name ASC;
    """,

    "customer_activity": """
       WITH OrderTotals AS (
            SELECT 
                o.user_id,
                o.id as order_id,
                o.bonuses_spent,
                SUM(oi.quantity * oi.price) - o.bonuses_spent as net_order_price
            FROM order_order o
            JOIN order_orderitem oi ON o.id = oi.order_id
            WHERE o.is_completed = TRUE AND o.created_at BETWEEN %s AND %s
            GROUP BY o.user_id, o.id, o.bonuses_spent
        )
        SELECT 
            ac.full_name as client_name,
            ac.phone_number as phone,
            COUNT(ot.order_id) as total_orders,
            COALESCE(SUM(ot.bonuses_spent), 0) as total_bonuses_used,
            COALESCE(SUM(ot.net_order_price), 0) as total_real_money_spent
        FROM account_user ac
        JOIN OrderTotals ot ON ac.id = ot.user_id
        GROUP BY ac.id, ac.full_name, ac.phone_number
        ORDER BY total_real_money_spent DESC;
    """,

    "neactive_client": """
        SELECT
            ac.full_name,
            ac.email,
            ac.phone_number,
            bw.balance
        FROM account_user ac
        JOIN account_bonuswallet bw on bw.user_id = ac.id
        LEFT JOIN order_order o ON o.user_id = ac.id
        WHERE o.user_id IS NULL AND ac.is_staff = FALSE AND ac.is_superuser = FALSE
    """
}