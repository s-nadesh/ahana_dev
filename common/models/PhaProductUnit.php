<?php

namespace common\models;

use common\models\CoTenant;
use common\models\query\PhaProductUnitQuery;
use common\models\RActiveRecord;

/**
 * This is the model class for table "pha_product_unit".
 *
 * @property integer $product_unit_id
 * @property integer $tenant_id
 * @property string $product_unit
 * @property string $status
 * @property integer $created_by
 * @property string $created_at
 * @property integer $modified_by
 * @property string $modified_at
 * @property string $deleted_at
 */
class PhaProductUnit extends PActiveRecord {

    /**
     * @inheritdoc
     */
    public static function tableName() {
        return 'pha_product_unit';
    }

    /**
     * @inheritdoc
     */
    public function rules() {
        return [
                [['product_unit'], 'required'],
                [['tenant_id', 'created_by', 'modified_by'], 'integer'],
                [['status'], 'string'],
                [['created_at', 'modified_at', 'deleted_at'], 'safe'],
                [['product_unit'], 'string', 'max' => 20],
                [['tenant_id'], 'exist', 'skipOnError' => true, 'targetClass' => CoTenant::className(), 'targetAttribute' => ['tenant_id' => 'tenant_id']],
                [['product_unit'], 'unique', 'targetAttribute' => ['product_unit', 'deleted_at'], 'comboNotUnique' => 'The combination of Product unit has already been taken.']
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels() {
        return [
            'product_unit_id' => 'Product Unit ID',
            'tenant_id' => 'Tenant ID',
            'product_unit' => 'Product Unit',
            'status' => 'Status',
            'created_by' => 'Created By',
            'created_at' => 'Created At',
            'modified_by' => 'Modified By',
            'modified_at' => 'Modified At',
            'deleted_at' => 'Deleted At',
        ];
    }

    public static function find() {
        return new PhaProductUnitQuery(get_called_class());
    }
    
    public static function getProductUnitList($status = '1', $deleted = false) {
        if (!$deleted)
            $list = self::find()->status($status)->active()->all();
        else
            $list = self::find()->deleted()->all();
        
        return $list;
    }

}
